require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/product_restrictions', require('./routes/productRestrictions'));
app.use('/api/products', require('./routes/products'));
app.use('/api/product_details', require('./routes/productDetails'));
app.use('/api/product_variants', require('./routes/productVariants'));
app.use('/api/variant_prices', require('./routes/variantPrices'));
app.use('/api/categories', require('./routes/categories'));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/customer-addresses', require('./routes/customerAddresses'));
app.use('/api/wishlists', require('./routes/wishlist'));


// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connected successfully', time: result.rows[0] });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 6011;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
