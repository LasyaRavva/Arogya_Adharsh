const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const {
  sendOrderConfirmationEmail,
  sendPaymentReceivedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} = require('../utils/orderEmail');

const router = express.Router();

const buildVariantLabel = (variant = {}) => {
  const directLabel =
    variant.variant_label ||
    variant.label ||
    variant.display_label ||
    variant.size_label ||
    variant.weight_label ||
    variant.volume_label;

  if (directLabel) return directLabel;

  const value =
    variant.variant_value ??
    variant.value ??
    variant.size ??
    variant.weight ??
    variant.volume ??
    variant.qty ??
    variant.quantity;

  const unit =
    variant.variant_unit ||
    variant.unit ||
    variant.uom ||
    variant.measure_unit;

  if (value !== undefined && value !== null && unit) {
    return `${value} ${unit}`;
  }

  if (value !== undefined && value !== null) {
    return String(value);
  }

  return null;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'dev-admin-key';

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(403).json({ error: 'Admin access denied' });
  }

  next();
};

const ensureOrderTimelineColumns = async () => {
  await db.query(`
    ALTER TYPE adharsh.order_status_enum ADD VALUE IF NOT EXISTS 'CONFIRMED'
  `);

  await db.query(`
    ALTER TABLE adharsh.orders
    ADD COLUMN IF NOT EXISTS shipped_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS delivered_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'UNPAID',
    ADD COLUMN IF NOT EXISTS paid_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS address_id integer,
    ADD COLUMN IF NOT EXISTS payment_gateway varchar(50),
    ADD COLUMN IF NOT EXISTS payment_reference varchar(100)
  `);
  // Backfill existing SHIPPED/DELIVERED rows that pre-date the column addition
  await db.query(`
    UPDATE adharsh.orders
    SET shipped_at = created_at
    WHERE status IN ('SHIPPED', 'DELIVERED') AND shipped_at IS NULL
  `);
  await db.query(`
    UPDATE adharsh.orders
    SET delivered_at = created_at
    WHERE status = 'DELIVERED' AND delivered_at IS NULL
  `);
  await db.query(`
    UPDATE adharsh.orders
    SET payment_status = COALESCE(payment_status, 'UNPAID')
    WHERE payment_status IS NULL
  `);
};

const fetchDeliveryAddress = async ({ customerId, addressId = null }) => {
  if (addressId) {
    const byIdResult = await db.query(
      `
      SELECT
        ca.address_id,
        ca.first_name,
        ca.last_name,
        ca.company_name,
        ca.address_line1,
        ca.address_line2,
        ca.city,
        ca.state,
        ca.postal_code,
        ca.email,
        ca.phone,
        c.name AS country_name
      FROM adharsh.customer_addresses ca
      LEFT JOIN adharsh.countries c ON c.country_id = ca.country_id
      WHERE ca.address_id = $1 AND ca.customer_id = $2
      LIMIT 1
      `,
      [addressId, customerId]
    );

    if (byIdResult.rows[0]) {
      return byIdResult.rows[0];
    }
  }

  const fallbackResult = await db.query(
    `
    SELECT
      ca.address_id,
      ca.first_name,
      ca.last_name,
      ca.company_name,
      ca.address_line1,
      ca.address_line2,
      ca.city,
      ca.state,
      ca.postal_code,
      ca.email,
      ca.phone,
      c.name AS country_name
    FROM adharsh.customer_addresses ca
    LEFT JOIN adharsh.countries c ON c.country_id = ca.country_id
    WHERE ca.customer_id = $1
    ORDER BY ca.is_default DESC, ca.created_at DESC
    LIMIT 1
    `,
    [customerId]
  );

  return fallbackResult.rows[0] || null;
};

const fetchOrderEmailContext = async ({ orderId, customerId, addressId = null }) => {
  const customerResult = await db.query(
    `SELECT name, email FROM adharsh.customers WHERE cus_id = $1`,
    [customerId]
  );

  const orderItemsResult = await db.query(
    `
    SELECT
      oi.quantity,
      oi.price,
      p.name AS product_name,
      pv.sku AS variant_sku,
      pv.*
    FROM adharsh.order_items oi
    LEFT JOIN adharsh.product_variants pv ON pv.pro_var_id = oi.product_variant_id
    LEFT JOIN adharsh.products p ON p.pro_id = pv.product_id
    WHERE oi.order_id = $1
    ORDER BY oi.order_item_id ASC
    `,
    [orderId]
  );

  const emailItems = orderItemsResult.rows.map((row) => ({
    product_name: row.product_name,
    quantity: Number(row.quantity || 0),
    price: Number(row.price || 0),
    variant_sku: row.variant_sku,
    variant_label: buildVariantLabel(row),
  }));

  const address = await fetchDeliveryAddress({ customerId, addressId });

  return {
    customer: customerResult.rows[0],
    emailItems,
    address,
  };
};

router.post('/', authenticate, async (req, res) => {
  const {
    country_id,
    currency_code,
    total_amount,
    shipping_carrier = null,
    shipping_cost = 0,
    duties_tax = 0,
    items,
    payment_status = 'PAID',
    address_id = null,
    payment_gateway = null,
    payment_reference = null,
  } = req.body;

  if (!country_id || !currency_code || !total_amount || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'country_id, currency_code, total_amount and at least one item are required',
    });
  }

  const invalidItem = items.find(
    (item) => !item.product_variant_id || !item.quantity || !item.price || item.quantity < 1
  );

  if (invalidItem) {
    return res.status(400).json({
      error: 'Each item must contain product_variant_id, quantity (>0), and price',
    });
  }

  const customerId = req.user?.cus_id;
  if (!customerId) {
    return res.status(401).json({ error: 'Customer identity missing in token' });
  }

  const paymentMethod = String(shipping_carrier || '').toUpperCase();
  const isCod = paymentMethod === 'CASH ON DELIVERY';
  if (isCod) {
    return res.status(400).json({ error: 'Cash on delivery is no longer available.' });
  }
  const allowedPaymentStatuses = ['PAID', 'UNPAID'];
  const requestedPaymentStatus = String(payment_status || '').toUpperCase();
  const normalizedPaymentStatus = requestedPaymentStatus || 'PAID';

  const initialOrderStatus = 'CONFIRMED';
  if (!allowedPaymentStatuses.includes(normalizedPaymentStatus)) {
    return res.status(400).json({
      error: `Invalid payment_status. Allowed values: ${allowedPaymentStatuses.join(', ')}`,
    });
  }

  const normalizedPaymentGateway = payment_gateway ? String(payment_gateway).trim().toUpperCase() : null;
  const normalizedPaymentReference = payment_reference ? String(payment_reference).trim() : null;

  const parsedAddressId = address_id !== null && address_id !== undefined && address_id !== ''
    ? Number(address_id)
    : null;

  if (parsedAddressId !== null && Number.isNaN(parsedAddressId)) {
    return res.status(400).json({ error: 'Invalid address_id' });
  }

  let resolvedAddressId = parsedAddressId;
  if (resolvedAddressId !== null) {
    const addressCheck = await db.query(
      `
      SELECT address_id
      FROM adharsh.customer_addresses
      WHERE address_id = $1 AND customer_id = $2
      LIMIT 1
      `,
      [resolvedAddressId, customerId]
    );

    if (addressCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Selected address does not belong to this customer' });
    }
  } else {
    const fallbackAddress = await fetchDeliveryAddress({ customerId });
    resolvedAddressId = fallbackAddress?.address_id || null;
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');
    await ensureOrderTimelineColumns();

    const requestedQuantities = items.reduce((accumulator, item) => {
      const variantId = Number(item.product_variant_id);
      const requestedQty = Number(item.quantity || 0);
      accumulator.set(variantId, (accumulator.get(variantId) || 0) + requestedQty);
      return accumulator;
    }, new Map());

    const variantIds = Array.from(requestedQuantities.keys());
    const variantStockResult = await client.query(
      `
      SELECT
        pv.pro_var_id,
        pv.product_id,
        pv.sku,
        p.name AS product_name,
        COALESCE(p.stocks, 0) AS available_stock
      FROM adharsh.product_variants pv
      INNER JOIN adharsh.products p ON p.pro_id = pv.product_id
      WHERE pv.pro_var_id = ANY($1::int[])
      FOR UPDATE
      `,
      [variantIds]
    );

    if (variantStockResult.rows.length !== variantIds.length) {
      const stockError = new Error('One or more ordered variants were not found');
      stockError.statusCode = 400;
      throw stockError;
    }

    const variantStockMap = new Map(
      variantStockResult.rows.map((row) => [Number(row.pro_var_id), row])
    );

    const requestedProductQuantities = new Map();

    for (const [variantId, requestedQty] of requestedQuantities.entries()) {
      const variantRow = variantStockMap.get(variantId);
      const productId = Number(variantRow?.product_id);
      requestedProductQuantities.set(
        productId,
        (requestedProductQuantities.get(productId) || 0) + requestedQty
      );
    }

    const productStockMap = new Map();
    for (const variantRow of variantStockResult.rows) {
      productStockMap.set(Number(variantRow.product_id), variantRow);
    }

    for (const [productId, requestedQty] of requestedProductQuantities.entries()) {
      const productRow = productStockMap.get(productId);
      const availableQty = Number(productRow?.available_stock || 0);

      if (requestedQty > availableQty) {
        const productLabel = productRow?.product_name || productRow?.sku || `Product ${productId}`;
        const stockError = new Error(
          `${productLabel} only has ${availableQty} item(s) left in stock`
        );
        stockError.statusCode = 400;
        throw stockError;
      }
    }

    for (const [productId, requestedQty] of requestedProductQuantities.entries()) {
      const stockUpdateResult = await client.query(
        `
        UPDATE adharsh.products
        SET stocks = stocks - $1
        WHERE pro_id = $2 AND stocks >= $1
        RETURNING pro_id, stocks
        `,
        [requestedQty, productId]
      );

      if (stockUpdateResult.rows.length === 0) {
        const stockError = new Error('Stock update failed due to insufficient quantity');
        stockError.statusCode = 400;
        throw stockError;
      }
    }

    const paidAt = normalizedPaymentStatus === 'PAID' ? new Date() : null;
    const shippedAt = null;
    const deliveredAt = null;

    const orderResult = await client.query(
      `
      INSERT INTO adharsh.orders (
        customer_id,
        country_id,
        currency_code,
        total_amount,
        shipping_carrier,
        shipping_cost,
        duties_tax,
        status,
        payment_status,
        payment_gateway,
        payment_reference,
        paid_at,
        shipped_at,
        delivered_at,
        address_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING order_id, customer_id, country_id, currency_code, total_amount, shipping_cost, duties_tax, status, payment_status, payment_gateway, payment_reference, paid_at, shipped_at, delivered_at, address_id, created_at
      `,
      [
        customerId,
        country_id,
        currency_code,
        total_amount,
        shipping_carrier,
        shipping_cost,
        duties_tax,
        initialOrderStatus,
        normalizedPaymentStatus,
        normalizedPaymentGateway,
        normalizedPaymentReference,
        paidAt,
        shippedAt,
        deliveredAt,
        resolvedAddressId,
      ]
    );

    const createdOrder = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `
        INSERT INTO adharsh.order_items (order_id, product_variant_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        `,
        [createdOrder.order_id, item.product_variant_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    try {
      const { customer, emailItems, address } = await fetchOrderEmailContext({
        orderId: createdOrder.order_id,
        customerId,
        addressId: createdOrder.address_id,
      });

      const adminMailResult = await sendOrderConfirmationEmail({
        customer,
        order: {
          ...createdOrder,
          shipping_cost,
          duties_tax,
        },
        items: emailItems,
        address,
      });
      console.log('Order email result:', adminMailResult);

      if (normalizedPaymentStatus === 'PAID' && customer?.email) {
        const paidMailResult = await sendPaymentReceivedEmail({
          customer,
          order: {
            ...createdOrder,
            shipping_cost,
            duties_tax,
          },
          items: emailItems,
          address,
        });
        console.log('Order email result:', paidMailResult);
      }
    } catch (emailError) {
      console.error('Order created, but email failed:', emailError.message || emailError);
    }

    return res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create order' });
  } finally {
    client.release();
  }
});

router.get('/my', authenticate, async (req, res) => {
  const customerId = req.user?.cus_id;

  if (!customerId) {
    return res.status(401).json({ error: 'Customer identity missing in token' });
  }

  try {
    await ensureOrderTimelineColumns();

    const result = await db.query(
      `
      SELECT
        o.order_id,
        o.status,
        o.shipping_carrier,
        o.payment_status,
        o.payment_gateway,
        o.payment_reference,
        o.paid_at,
        o.created_at,
        o.shipped_at,
        o.delivered_at,
        o.total_amount,
        o.currency_code,
        o.shipping_cost,
        o.duties_tax,
        o.address_id,
        ca.first_name AS address_first_name,
        ca.last_name AS address_last_name,
        ca.company_name AS address_company_name,
        ca.address_line1 AS address_line1,
        ca.address_line2 AS address_line2,
        ca.city AS address_city,
        ca.state AS address_state,
        ca.postal_code AS address_postal_code,
        ca.email AS address_email,
        ca.phone AS address_phone,
        c.name AS address_country_name,
        oi.order_item_id,
        oi.product_variant_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.image_1 AS product_image,
        pv.sku AS variant_sku,
        pv.*
      FROM adharsh.orders o
      LEFT JOIN adharsh.customer_addresses ca ON ca.address_id = o.address_id
      LEFT JOIN adharsh.countries c ON c.country_id = ca.country_id
      LEFT JOIN adharsh.order_items oi ON oi.order_id = o.order_id
      LEFT JOIN adharsh.product_variants pv ON pv.pro_var_id = oi.product_variant_id
      LEFT JOIN adharsh.products p ON p.pro_id = pv.product_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC, oi.order_item_id ASC
      `,
      [customerId]
    );

    const orderMap = new Map();

    for (const row of result.rows) {
      if (!orderMap.has(row.order_id)) {
        orderMap.set(row.order_id, {
          order_id: row.order_id,
          status: row.status,
          shipping_carrier: row.shipping_carrier,
          payment_status: row.payment_status,
          payment_gateway: row.payment_gateway,
          payment_reference: row.payment_reference,
          paid_at: row.paid_at,
          created_at: row.created_at,
          shipped_at: row.shipped_at,
          delivered_at: row.delivered_at,
          total_amount: Number(row.total_amount || 0),
          currency_code: row.currency_code,
          shipping_cost: Number(row.shipping_cost || 0),
          duties_tax: Number(row.duties_tax || 0),
          address: {
            address_id: row.address_id,
            first_name: row.address_first_name,
            last_name: row.address_last_name,
            company_name: row.address_company_name,
            address_line1: row.address_line1,
            address_line2: row.address_line2,
            city: row.address_city,
            state: row.address_state,
            postal_code: row.address_postal_code,
            country_name: row.address_country_name,
            email: row.address_email,
            phone: row.address_phone,
          },
          items: [],
        });
      }

      if (row.order_item_id) {
        const variantLabel = buildVariantLabel(row);
        orderMap.get(row.order_id).items.push({
          order_item_id: row.order_item_id,
          product_variant_id: row.product_variant_id,
          product_name: row.product_name,
          variant_sku: row.variant_sku,
          variant_label: variantLabel,
          quantity: Number(row.quantity || 0),
          price: Number(row.price || 0),
          product_image: row.product_image,
        });
      }
    }

    return res.json(Array.from(orderMap.values()));
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/top-products', async (req, res) => {
  const countryIdRaw = req.query.country_id;
  const limitRaw = req.query.limit;

  const countryId = countryIdRaw ? Number(countryIdRaw) : null;
  const limit = Number(limitRaw || 3);

  if (countryIdRaw && Number.isNaN(countryId)) {
    return res.status(400).json({ error: 'Invalid country_id' });
  }

  if (Number.isNaN(limit) || limit < 1 || limit > 50) {
    return res.status(400).json({ error: 'Invalid limit. Allowed range: 1-50' });
  }

  try {
    const result = await db.query(
      `
      WITH ordered_products AS (
        SELECT
          pv.product_id,
          SUM(oi.quantity)::int AS total_ordered,
          AVG(oi.price)::numeric AS avg_order_price
        FROM adharsh.order_items oi
        INNER JOIN adharsh.product_variants pv ON pv.pro_var_id = oi.product_variant_id
        GROUP BY pv.product_id
      ),
      review_summary AS (
        SELECT
          LOWER(TRIM(product)) AS product_name_key,
          COUNT(*)::int AS review_count,
          AVG(rating)::numeric(10,2) AS avg_rating
        FROM adharsh.reviews
        WHERE approved = true
        GROUP BY LOWER(TRIM(product))
      ),
      country_prices AS (
        SELECT
          pv.product_id,
          MIN(vp.price)::numeric AS min_price,
          MAX(vp.currency_code) AS currency_code
        FROM adharsh.product_variants pv
        INNER JOIN adharsh.variant_prices vp ON vp.product_variant_id = pv.pro_var_id
        WHERE ($1::int IS NULL OR vp.country_id = $1)
        GROUP BY pv.product_id
      ),
      available_products AS (
        SELECT DISTINCT pv.product_id
        FROM adharsh.product_variants pv
        INNER JOIN adharsh.variant_prices vp ON vp.product_variant_id = pv.pro_var_id
        WHERE ($1::int IS NULL OR vp.country_id = $1)
      )
      SELECT
        p.pro_id AS id,
        p.name,
        p.image_1,
        p.image_2,
        p.image_3,
        COALESCE(rs.avg_rating, p.rating, 0) AS rating,
        COALESCE(rs.review_count, 0) AS review_count,
        COALESCE(op.total_ordered, 0) AS total_ordered,
        COALESCE(cp.min_price, op.avg_order_price, 0)::numeric AS price,
        COALESCE(cp.currency_code, 'INR') AS currency_code
      FROM available_products ap
      INNER JOIN adharsh.products p ON p.pro_id = ap.product_id
      LEFT JOIN ordered_products op ON op.product_id = p.pro_id
      LEFT JOIN review_summary rs ON rs.product_name_key = LOWER(TRIM(p.name))
      LEFT JOIN country_prices cp ON cp.product_id = p.pro_id
      ORDER BY COALESCE(op.total_ordered, 0) DESC, p.pro_id DESC
      LIMIT $2
      `,
      [countryId, limit]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch top products error:', error);
    return res.status(500).json({ error: 'Failed to fetch top ordered products' });
  }
});

router.patch('/:order_id/status', authenticateAdmin, async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const normalizedStatus = String(status || '').toUpperCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
    });
  }

  try {
    await ensureOrderTimelineColumns();

    const previousOrderResult = await db.query(
      `
      SELECT
        order_id,
        customer_id,
        address_id,
        status,
        payment_status,
        created_at,
        currency_code,
        total_amount,
        shipping_cost,
        duties_tax
      FROM adharsh.orders
      WHERE order_id = $1
      LIMIT 1
      `,
      [order_id]
    );

    if (previousOrderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousOrder = previousOrderResult.rows[0];

    let updateQuery = '';
    let params = [];

    if (normalizedStatus === 'PENDING') {
      updateQuery = `
        UPDATE adharsh.orders
        SET status = $1,
            shipped_at = NULL,
            delivered_at = NULL
        WHERE order_id = $2
        RETURNING order_id, status, payment_status, paid_at, created_at, shipped_at, delivered_at, customer_id
      `;
      params = [normalizedStatus, order_id];
    } else if (normalizedStatus === 'CONFIRMED') {
      updateQuery = `
        UPDATE adharsh.orders
        SET status = $1,
            shipped_at = NULL,
            delivered_at = NULL
        WHERE order_id = $2
        RETURNING order_id, status, payment_status, paid_at, created_at, shipped_at, delivered_at, customer_id
      `;
      params = [normalizedStatus, order_id];
    } else if (normalizedStatus === 'SHIPPED') {
      updateQuery = `
        UPDATE adharsh.orders
        SET status = $1,
            shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP),
            delivered_at = NULL
        WHERE order_id = $2
        RETURNING order_id, status, payment_status, paid_at, created_at, shipped_at, delivered_at, customer_id
      `;
      params = [normalizedStatus, order_id];
    } else {
      updateQuery = `
        UPDATE adharsh.orders
        SET status = $1,
            shipped_at = COALESCE(shipped_at, CURRENT_TIMESTAMP),
            delivered_at = CURRENT_TIMESTAMP,
            payment_status = CASE
              WHEN UPPER(COALESCE(shipping_carrier, '')) = 'CASH ON DELIVERY' THEN 'PAID'
              ELSE payment_status
            END,
            paid_at = CASE
              WHEN UPPER(COALESCE(shipping_carrier, '')) = 'CASH ON DELIVERY'
                THEN COALESCE(paid_at, CURRENT_TIMESTAMP)
              ELSE paid_at
            END
        WHERE order_id = $2
        RETURNING order_id, status, payment_status, paid_at, created_at, shipped_at, delivered_at, customer_id
      `;
      params = [normalizedStatus, order_id];
    }

    const result = await db.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = result.rows[0];
    const wasShippedBefore = String(previousOrder.status || '').toUpperCase() === 'SHIPPED';
    const isShippedNow = String(updatedOrder.status || '').toUpperCase() === 'SHIPPED';
    const shippedJustCompleted = !wasShippedBefore && isShippedNow;
    const wasDeliveredBefore = String(previousOrder.status || '').toUpperCase() === 'DELIVERED';
    const isDeliveredNow = String(updatedOrder.status || '').toUpperCase() === 'DELIVERED';
    const deliveredJustCompleted = !wasDeliveredBefore && isDeliveredNow;
    const wasPaidBefore = String(previousOrder.payment_status || '').toUpperCase() === 'PAID';
    const isPaidNow = String(updatedOrder.payment_status || '').toUpperCase() === 'PAID';
    const paymentJustCompleted = !wasPaidBefore && isPaidNow;

    if (paymentJustCompleted) {
      try {
        const { customer, emailItems, address } = await fetchOrderEmailContext({
          orderId: updatedOrder.order_id,
          customerId: updatedOrder.customer_id,
          addressId: previousOrder.address_id,
        });

        if (customer?.email) {
          const paidMailResult = await sendPaymentReceivedEmail({
            customer,
            order: {
              ...previousOrder,
              status: updatedOrder.status,
              payment_status: updatedOrder.payment_status,
              paid_at: updatedOrder.paid_at,
              shipped_at: updatedOrder.shipped_at,
              delivered_at: updatedOrder.delivered_at,
            },
            items: emailItems,
            address,
          });
          console.log('Order email result:', paidMailResult);
        }
      } catch (emailError) {
        console.error('Order status updated, but paid email failed:', emailError.message || emailError);
      }
    }

    if (shippedJustCompleted) {
      try {
        const { customer, emailItems, address } = await fetchOrderEmailContext({
          orderId: updatedOrder.order_id,
          customerId: updatedOrder.customer_id,
          addressId: previousOrder.address_id,
        });

        if (customer?.email) {
          const shippedMailResult = await sendOrderShippedEmail({
            customer,
            order: {
              ...previousOrder,
              status: updatedOrder.status,
              payment_status: updatedOrder.payment_status,
              paid_at: updatedOrder.paid_at,
              shipped_at: updatedOrder.shipped_at,
              delivered_at: updatedOrder.delivered_at,
            },
            items: emailItems,
            address,
          });
          console.log('Order email result:', shippedMailResult);
        }
      } catch (emailError) {
        console.error('Order status updated, but shipped email failed:', emailError.message || emailError);
      }
    }

    if (deliveredJustCompleted) {
      try {
        const { customer, emailItems, address } = await fetchOrderEmailContext({
          orderId: updatedOrder.order_id,
          customerId: updatedOrder.customer_id,
          addressId: previousOrder.address_id,
        });

        if (customer?.email) {
          const deliveredMailResult = await sendOrderDeliveredEmail({
            customer,
            order: {
              ...previousOrder,
              status: updatedOrder.status,
              payment_status: updatedOrder.payment_status,
              paid_at: updatedOrder.paid_at,
              shipped_at: updatedOrder.shipped_at,
              delivered_at: updatedOrder.delivered_at,
            },
            items: emailItems,
            address,
          });
          console.log('Order email result:', deliveredMailResult);
        }
      } catch (emailError) {
        console.error('Order status updated, but delivered email failed:', emailError.message || emailError);
      }
    }

    return res.json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Admin update order status error:', error);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
