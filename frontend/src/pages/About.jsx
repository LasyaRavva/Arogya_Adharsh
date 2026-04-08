import { Link } from 'react-router-dom';
import React, { useState } from "react";
import { motion } from "framer-motion";
import aboutbg from '../assets/about_img.jpg';
import honeyImage from '../assets/oils.jpg';
import deliveryImage from '../assets/coconut oils.jpg';
import { API_BASE_URL } from '../config';

export default function About() {


// Inside your component function:
const [comment, setComment] = useState('');
const [rating, setRating] = useState(0);
  const [name, setName] = useState('');


// const handleCommentSubmit = (e) => {
//   e.preventDefault();
//   // Handle form submission here (e.g., send to API)
//   // Example: console.log({ comment, rating });
//   setComment('');
//   setRating(0);
// };





 const handleCommentSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API_BASE_URL}/api/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        description: comment,
        rating: rating,
      }),
    });

    if (res.ok) {
      alert("✅ Review submitted successfully!");

      setName("");
      setComment("");
      setRating(0);
    } else {
      alert("❌ Something went wrong!");
    }

  } catch (err) {
    alert("❌ Server error!");
    console.error(err);
  }
};









  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${honeyImage})`
        }}
      >
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold font-poppins"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 120 }}
          >
            <motion.span
              className="text-[#FF8A00] inline-block"
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.7, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.18, rotate: 10, textShadow: "0px 0px 12px #FF8A00" }}
            >
              100%
            </motion.span>{' '}
            <motion.span
              className="text-white inline-block"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.7, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.1, color: "#FF8A00", textShadow: "0px 0px 8px #FF8A00" }}
            >
              Trusted
            </motion.span>
          </motion.h1>
          <motion.h2
            className="text-4xl md:text-5xl font-normal font-poppins text-white mt-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8, type: "spring", stiffness: 80 }}
            whileHover={{ scale: 1.08, textShadow: "0px 0px 16px #fff" }}
          >
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
              transition={{ delay: 1.7, duration: 1, type: "spring", stiffness: 100 }}
              style={{ display: 'inline-block' }}
            >
              Organic Store
            </motion.span>
          </motion.h2>
        </motion.div>
      </div>

      {/* Content Section */}
      <motion.div
        className="max-w-7xl mx-auto px-4 md:px-12 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.18 } }
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="space-y-6"
            initial={{ x: -60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, type: "spring", bounce: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-semibold text-gray-900 font-poppins leading-tight"
              initial={{ x: 80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
            >
              Arogya Adarsh Organic and Natural Products 
            </motion.h2>
            <motion.p
              className="text-gray-600 font-poppins leading-relaxed text-base"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 80 }}
              viewport={{ once: true }}
            >
              At Arogya Adarsh Organic and Natural Products Pvt Ltd, we are committed to bringing nature’s purity directly to your home. Our mission is simple — to promote a healthier lifestyle by providing high-quality, chemical-free, and naturally sourced food products that you can trust.
In an era of synthetic lifestyle choices, "Arogya" (meaning health/wholeness) and "Adarsh" (meaning ideal/model) reflect our commitment to being the ideal model for healthy living.
We carefully curate and deliver a wide range of premium organic and natural products, ensuring that every item maintains its nutritional value, authentic taste, and traditional goodness.

            </motion.p>
          </motion.div>

          {/* Right Image */}
          <motion.div
            className="relative"
            initial={{ scale: 0.85, opacity: 0, rotate: 8 }}
            whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 1, type: "spring", bounce: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.04, rotate: -2, boxShadow: "0px 8px 32px #FF8A0033" }}
          >
            <div className="rounded-lg overflow-hidden shadow-xl">
              <motion.img
                src={honeyImage}
                alt="Organic honey dripping"
                className="w-full h-auto object-cover"
                initial={{ scale: 1.1, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, type: "spring" }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.07, filter: "brightness(1.08)" }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Natural Oils Section */}
      <div 
        className="relative py-20 bg-cover bg-center min-h-[100px]"
        style={{
          backgroundImage: `url(${aboutbg})`
        }}
      >
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.95) 65%, rgba(255,255,255,1) 80%)'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Empty space for product image background */}
            <div></div>

            {/* Right - Content */}
            <motion.div
              className="space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.22 } }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, type: "spring", bounce: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.h2
                  className="text-5xl font-bold text-gray-900 font-poppins mb-6"
                  initial={{ scale: 0.7, color: "#FF8A00", rotate: -8, opacity: 0 }}
                  whileInView={{ scale: [0.7, 1.15, 1], color: ["#FF8A00", "#007048", "#222"], rotate: [0, 8, 0], opacity: 1 }}
                  transition={{ duration: 1.1, type: "spring", stiffness: 120 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.08, color: "#FF8A00", textShadow: "0px 0px 18px #FF8A00" }}
                >
                  Natural Oils
                </motion.h2>
                <motion.p
                  className="text-gray-600 font-poppins leading-relaxed text-base"
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 80 }}
                  viewport={{ once: true }}
                >
                 
                </motion.p>
              </motion.div>

              {/* Features Grid - 2 columns */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.18 } }
                }}
              >
                {/* Left Column */}
                <div className="space-y-6">
                  {/* 100% Natural oil */}
                  <motion.div
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 60, rotate: -10 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.07, rotate: 4, boxShadow: "0px 4px 24px #D4F4E7" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D4F4E7] flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M36.4909 0.538949C36.4377 0.343152 36.3051 0.178413 36.1251 0.0846357C35.7699 -0.103321 35.3295 0.032269 35.1415 0.387478C35.141 0.388382 35.1405 0.389287 35.1401 0.390192C35.1401 0.410294 31.4533 7.56272 20.1357 8.80906C18.6593 8.96657 17.2163 9.35173 15.8579 9.95088C13.4264 11.008 11.4183 12.8477 10.1528 15.1775C8.9714 17.3659 8.48211 19.8614 8.74967 22.3339C8.94678 24.1363 9.54874 25.8709 10.5106 27.4078C8.50041 28.8511 2.12393 33.8405 1.54901 39.1958C1.50679 39.5954 1.79667 39.9537 2.1963 39.9959C2.59604 40.0381 2.95416 39.7482 2.99638 39.3486C3.52306 34.5682 9.50552 29.9326 11.371 28.5898C13.6104 31.3398 16.9635 32.8917 20.5618 33.145C22.9837 33.3013 25.4084 32.8883 27.6419 31.9389C30.0664 30.9216 32.2077 29.3308 33.8817 27.3032C38.1956 22.0766 40.2501 13.2919 36.4909 0.538949ZM11.7892 26.6881C11.5117 26.2512 11.2672 25.7943 11.0574 25.3211C10.616 24.3228 10.3312 23.2624 10.2131 22.1771C9.96687 19.9995 10.3874 17.7984 11.4193 15.865C12.5345 13.8152 14.3037 12.1975 16.4449 11.2696C17.669 10.7366 18.9682 10.3962 20.2965 10.2605C27.7665 9.45636 32.1609 6.13143 34.4284 3.71914C33.0962 8.10538 30.8024 12.1393 27.7143 15.5273L27.272 11.0726C27.2495 10.6713 26.9059 10.3643 26.5047 10.3868C26.1034 10.4093 25.7964 10.7529 25.8189 11.1541C25.82 11.1739 25.8219 11.1937 25.8246 11.2133L26.3915 16.9385C23.0103 20.3679 18.3104 23.8135 11.7892 26.6881ZM32.7559 26.3705V26.3745C31.235 28.2262 29.2868 29.6806 27.079 30.6121C25.0488 31.4701 22.8453 31.8391 20.6463 31.6896C17.585 31.5345 14.7122 30.1639 12.6656 27.8822C15.064 26.8209 17.383 25.5888 19.605 24.1954L25.9935 25.4016C26.3905 25.4638 26.7628 25.1923 26.825 24.7953C26.885 24.4123 26.6343 24.0495 26.2548 23.9703L21.3458 23.0415C23.6125 21.4848 25.7224 19.7115 27.6459 17.7466C27.6812 17.7162 27.7134 17.6826 27.7424 17.6461C32.8162 12.3632 34.9752 7.13655 35.8758 3.92017C38.3605 14.5181 36.4588 21.8917 32.7559 26.3705Z" fill="#007048"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 font-poppins mb-1">
                        100% Natural oil
                      </h3>
                      <p className="text-sm text-gray-500 font-poppins">
                        100% healthy & Natural.
                      </p>
                    </div>
                  </motion.div>

                  {/* Customer Feedback */}
                  <motion.div
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 60, rotate: 10 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: 0.1, duration: 0.7, type: "spring", bounce: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.07, rotate: -4, boxShadow: "0px 4px 24px #D4F4E7" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D4F4E7] flex items-center justify-center flex-shrink-0">
                      <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_211_5891)">
<path d="M31.1394 17.3701C30.9791 16.8755 30.5595 16.5219 30.0449 16.4472L23.9446 15.5607L21.2166 10.0334C20.9869 9.56686 20.521 9.2771 20.0009 9.2771C19.4808 9.2771 19.0148 9.56686 18.7852 10.033L16.057 15.5607L9.95664 16.4472C9.44234 16.5219 9.02297 16.8753 8.86211 17.37C8.7018 17.8639 8.83313 18.3962 9.20523 18.7595L13.6197 23.0623L12.5776 29.1378C12.4895 29.6501 12.696 30.1582 13.1166 30.4639C13.3543 30.6367 13.6324 30.7245 13.9123 30.7244C14.1278 30.7244 14.3444 30.6724 14.5445 30.5673L20.0009 27.6987L25.4569 30.5673C25.6505 30.6691 25.8687 30.7229 26.0875 30.7229C26.3759 30.7229 26.6515 30.6333 26.8847 30.4639C27.3046 30.1585 27.5113 29.6506 27.4237 29.1381L27.0116 26.7344C26.9525 26.3906 26.6257 26.1597 26.2823 26.2187C25.9384 26.2776 25.7076 26.6042 25.7666 26.948L26.1787 29.3512C26.1846 29.3859 26.1701 29.4217 26.1419 29.4422C26.1 29.4727 26.0696 29.4624 26.0444 29.4491L20.2944 26.4262C20.1105 26.3295 19.8908 26.3294 19.7066 26.4262L13.956 29.4493C13.9253 29.4655 13.8871 29.4626 13.8589 29.4422C13.8302 29.4213 13.8161 29.3868 13.8221 29.3516L14.9204 22.9486C14.9556 22.7436 14.8877 22.5346 14.7388 22.3895L10.0869 17.8553C10.0617 17.8307 10.0523 17.7933 10.063 17.7604C10.0739 17.727 10.1033 17.7022 10.1379 17.6972L16.5669 16.763C16.7727 16.733 16.9505 16.6039 17.0425 16.4174L19.9179 10.5916C19.9491 10.5282 20.0519 10.5276 20.0834 10.5919L22.9587 16.4174C23.0507 16.6038 23.2286 16.733 23.4343 16.763L29.8634 17.6972C29.8979 17.7023 29.9271 17.7268 29.938 17.7606C29.9488 17.7937 29.9395 17.8308 29.9145 17.8551L25.2625 22.3895C25.1137 22.5346 25.0457 22.7437 25.0809 22.9486L25.428 24.9716C25.4868 25.3154 25.8135 25.5463 26.1571 25.4873C26.5009 25.4283 26.7319 25.1018 26.6728 24.758L26.382 23.0623L30.7964 18.7593C31.1688 18.3962 31.3001 17.8637 31.1394 17.3701Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M3.63141 19.3685H0.631562C0.282734 19.3685 0 19.6513 0 20.0001C0 20.3489 0.282734 20.6316 0.631562 20.6316H3.63141C3.98031 20.6316 4.26297 20.3488 4.26297 20.0001C4.26297 19.6513 3.98023 19.3685 3.63141 19.3685Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M39.3677 19.3685H36.3679C36.019 19.3685 35.7363 19.6513 35.7363 20.0001C35.7363 20.3489 36.0191 20.6316 36.3679 20.6316H39.3677C39.7166 20.6316 39.9992 20.3488 39.9992 20.0001C39.9992 19.6513 39.7166 19.3685 39.3677 19.3685Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M7.98005 31.1276L5.85888 33.2487C5.61216 33.4953 5.61216 33.8952 5.8588 34.1418C5.98216 34.2652 6.1438 34.3268 6.30544 34.3268C6.467 34.3268 6.62872 34.2652 6.75192 34.1419L8.8731 32.0207C9.11981 31.7742 9.11981 31.3743 8.87317 31.1276C8.62653 30.881 8.22661 30.881 7.98005 31.1276Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M33.2496 5.85755L31.1284 7.97865C30.8817 8.22529 30.8817 8.62521 31.1283 8.87185C31.2517 8.99521 31.4133 9.05685 31.575 9.05685C31.7366 9.05685 31.8982 8.99521 32.0214 8.87177L34.1427 6.75068C34.3894 6.50412 34.3894 6.10419 34.1428 5.85755C33.8961 5.61083 33.4962 5.61076 33.2496 5.85755Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M20.0007 35.7375C19.6518 35.7375 19.3691 36.0204 19.3691 36.3691V39.3689C19.3691 39.7177 19.6519 40.0004 20.0007 40.0004C20.3496 40.0004 20.6322 39.7176 20.6322 39.3689V36.3691C20.6322 36.0203 20.3496 35.7375 20.0007 35.7375Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M20.0007 4.26309C20.3496 4.26309 20.6322 3.98028 20.6322 3.63153V0.631684C20.6322 0.282856 20.3495 0.00012207 20.0007 0.00012207C19.6518 0.00012207 19.3691 0.282934 19.3691 0.631684V3.63153C19.3691 3.98036 19.6518 4.26309 20.0007 4.26309Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M32.0214 31.1275C31.775 30.8808 31.375 30.8808 31.1283 31.1275C30.8817 31.374 30.8817 31.774 31.1284 32.0206L33.2496 34.1418C33.3729 34.2652 33.5346 34.3268 33.6962 34.3268C33.8578 34.3268 34.0195 34.2652 34.1428 34.1417C34.3894 33.8952 34.3894 33.4952 34.1427 33.2486L32.0214 31.1275Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
<path d="M7.97998 8.87201C8.10333 8.99537 8.26497 9.05701 8.42661 9.05701C8.58818 9.05701 8.7499 8.99537 8.87318 8.87217C9.11982 8.62553 9.11982 8.22561 8.87318 7.97897L6.75201 5.85771C6.50545 5.61107 6.1056 5.61107 5.85881 5.85771C5.61217 6.10427 5.61217 6.5042 5.85881 6.75084L7.97998 8.87201Z" fill="#007048" stroke="#007048" stroke-width="0.3"/>
</g>
<defs>
<clipPath id="clip0_211_5891">
<rect width="40" height="40" fill="white"/>
</clipPath>
</defs>
</svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 font-poppins mb-1">
                        Customer Feedback
                      </h3>
                      <p className="text-sm text-gray-500 font-poppins">
                        Our happy customer
                      </p>
                    </div>
                  </motion.div>

                  {/* Free Shipping */}
                  <motion.div
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 60, rotate: -8 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, type: "spring", bounce: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.07, rotate: 4, boxShadow: "0px 4px 24px #D4F4E7" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D4F4E7] flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.7021 26.3043C31.7247 26.3043 30.7962 26.6871 30.0957 27.3794C29.3952 28.0799 29.0043 28.9921 29.0043 29.9695C29.0043 30.9469 29.3871 31.8591 30.0957 32.5596C30.8043 33.2519 31.7247 33.6348 32.7021 33.6348C34.7058 33.6348 36.3348 31.9895 36.3348 29.9695C36.3348 27.9496 34.7058 26.3043 32.7021 26.3043ZM32.7021 32.0058C31.5781 32.0058 30.6333 31.0772 30.6333 29.9695C30.6333 28.8618 31.5781 27.9333 32.7021 27.9333C33.8098 27.9333 34.7058 28.8455 34.7058 29.9695C34.7058 31.0935 33.8098 32.0058 32.7021 32.0058ZM33.6469 14.0949C33.5003 13.9565 33.3048 13.8832 33.1012 13.8832H28.9228C28.4749 13.8832 28.1083 14.2497 28.1083 14.6977V21.3766C28.1083 21.8245 28.4749 22.1911 28.9228 22.1911H35.5528C36.0008 22.1911 36.3673 21.8245 36.3673 21.3766V16.905C36.3673 16.6769 36.2696 16.457 36.0986 16.3022L33.6469 14.0949ZM34.7383 20.5621H29.7373V15.504H32.7835L34.7383 17.2633V20.5621ZM12.8121 26.3043C11.8347 26.3043 10.9061 26.6871 10.2057 27.3794C9.50519 28.0799 9.11423 28.9921 9.11423 29.9695C9.11423 30.9469 9.49705 31.8591 10.2057 32.5596C10.9143 33.2519 11.8347 33.6348 12.8121 33.6348C14.8157 33.6348 16.4447 31.9895 16.4447 29.9695C16.4447 27.9496 14.8157 26.3043 12.8121 26.3043ZM12.8121 32.0058C11.688 32.0058 10.7432 31.0772 10.7432 29.9695C10.7432 28.8618 11.688 27.9333 12.8121 27.9333C13.9198 27.9333 14.8157 28.8455 14.8157 29.9695C14.8157 31.0935 13.9198 32.0058 12.8121 32.0058ZM7.37935 27.3061H5.74221V25.1395C5.74221 24.6916 5.37569 24.325 4.92771 24.325C4.47974 24.325 4.11322 24.6916 4.11322 25.1395V28.1206C4.11322 28.5686 4.47974 28.9351 4.92771 28.9351H7.37935C7.82733 28.9351 8.19385 28.5686 8.19385 28.1206C8.19385 27.6726 7.82733 27.3061 7.37935 27.3061ZM11.5089 22.8671C11.5089 22.4191 11.1423 22.0526 10.6944 22.0526H0.814498C0.366524 22.0526 0 22.4191 0 22.8671C0 23.3151 0.366524 23.6816 0.814498 23.6816H10.6944C11.1423 23.6816 11.5089 23.3232 11.5089 22.8671ZM2.46793 19.9267L12.3478 19.9838C12.7958 19.9838 13.1623 19.6254 13.1704 19.1774C13.1786 18.7213 12.8121 18.3548 12.3641 18.3548L2.48422 18.2978C2.47607 18.2978 2.47607 18.2978 2.47607 18.2978C2.0281 18.2978 1.66158 18.6561 1.66158 19.1041C1.65343 19.5602 2.01996 19.9267 2.46793 19.9267ZM4.12951 16.2289H14.0094C14.4573 16.2289 14.8239 15.8624 14.8239 15.4144C14.8239 14.9665 14.4573 14.5999 14.0094 14.5999H4.12951C3.68153 14.5999 3.31501 14.9665 3.31501 15.4144C3.31501 15.8624 3.68153 16.2289 4.12951 16.2289ZM39.6986 15.1294L33.8668 10.2994C33.7202 10.1772 33.541 10.112 33.3456 10.112H26.4875V7.17985C26.4875 6.73188 26.121 6.36536 25.673 6.36536H4.92771C4.47974 6.36536 4.11322 6.73188 4.11322 7.17985V13.142C4.11322 13.59 4.47974 13.9565 4.92771 13.9565C5.37569 13.9565 5.74221 13.59 5.74221 13.142V7.99435H24.8666V27.3061H18.1877C17.7398 27.3061 17.3732 27.6726 17.3732 28.1206C17.3732 28.5686 17.7398 28.9351 18.1877 28.9351H28.1328C28.5807 28.9351 28.9473 28.5686 28.9473 28.1206C28.9473 27.6726 28.5807 27.3061 28.1328 27.3061H26.4956V11.741H33.0605L38.371 16.1393L38.314 27.2898H37.4669C37.0189 27.2898 36.6524 27.6563 36.6524 28.1043C36.6524 28.5523 37.0189 28.9188 37.4669 28.9188H39.1203C39.5683 28.9188 39.9348 28.5604 39.9348 28.1125L40 15.7647C39.9919 15.5203 39.886 15.2841 39.6986 15.1294Z" fill="#007048"/>
</svg>

                    </div>
                    <div>
                      <h3 className="text- base font-semibold text-gray-900 font-poppins mb-1">
                        Free Shipping
                      </h3>
                      <p className="text-sm text-gray-500 font-poppins">
                        Free shipping with discount
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Great Support 24/7 */}
                  <motion.div
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 60, rotate: 8 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: 0.1, duration: 0.7, type: "spring", bounce: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.07, rotate: -4, boxShadow: "0px 4px 24px #D4F4E7" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D4F4E7] flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M30.3165 13.6891V12.305C30.3165 8.99244 29.1443 5.91429 27.0191 3.63025C24.8409 1.28571 21.8459 0 18.5787 0H17.4367C14.1695 0 11.1745 1.28571 8.99636 3.63025C6.87115 5.91429 5.69888 8.99244 5.69888 12.305V13.6891C3.11989 13.863 1.07031 16.0109 1.07031 18.6353V20.7983C1.07031 23.5286 3.29384 25.7521 6.02409 25.7521H8.81485C9.31401 25.7521 9.72241 25.3437 9.72241 24.8445V14.5815C9.72241 14.0824 9.31401 13.674 8.81485 13.674H7.51401V12.305C7.51401 6.32269 11.7796 1.81513 17.4291 1.81513H18.5712C24.2283 1.81513 28.4863 6.32269 28.4863 12.305V13.674H27.1854C26.6863 13.674 26.2779 14.0824 26.2779 14.5815V24.837C26.2779 25.3361 26.6863 25.7445 27.1854 25.7445H28.456C28.0854 30.479 24.8258 31.5756 23.3132 31.8252C22.8972 30.5471 21.6947 29.6244 20.2804 29.6244H18.0115C16.2569 29.6244 14.8275 31.0538 14.8275 32.8084C14.8275 34.563 16.2569 36 18.0115 36H20.288C21.7552 36 22.988 35.0017 23.3585 33.6555C24.0997 33.5496 25.272 33.2849 26.4367 32.6042C28.0779 31.6437 30.0216 29.6849 30.2787 25.737C32.8728 25.5782 34.93 23.4227 34.93 20.7908V18.6277C34.9375 16.0109 32.8955 13.8555 30.3165 13.6891ZM7.92241 23.9294H6.03922C4.30729 23.9294 2.90056 22.5227 2.90056 20.7908V18.6277C2.90056 16.8958 4.30729 15.4891 6.03922 15.4891H7.92241V23.9294ZM20.288 34.1849H18.0115C17.2552 34.1849 16.6426 33.5723 16.6426 32.816C16.6426 32.0597 17.2552 31.4471 18.0115 31.4471H20.288C21.0443 31.4471 21.6569 32.0597 21.6569 32.816C21.6569 33.5723 21.0443 34.1849 20.288 34.1849ZM33.1224 20.7908C33.1224 22.5227 31.7157 23.9294 29.9838 23.9294H28.1006V15.4891H29.9838C31.7157 15.4891 33.1224 16.8958 33.1224 18.6277V20.7908Z" fill="#007048"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 font-poppins mb-1">
                        Great Support 24/7
                      </h3>
                      <p className="text-sm text-gray-500 font-poppins">
                        Instant access to Contact
                      </p>
                    </div>
                  </motion.div>

                  {/* 100% Sucure Payment */}
                  <motion.div
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 60, rotate: -12 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, type: "spring", bounce: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.07, rotate: 4, boxShadow: "0px 4px 24px #D4F4E7" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D4F4E7] flex items-center justify-center flex-shrink-0">
                      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M32.3814 31.201L30.3098 7.85427C30.2725 7.39226 29.885 7.04202 29.4156 7.04202H25.0488C25.0413 3.15959 21.8817 0 17.9993 0C14.1169 0 10.9573 3.15959 10.9498 7.04202H6.58303C6.12102 7.04202 5.73352 7.39226 5.68881 7.85427L3.61719 31.201C3.61719 31.2308 3.61719 31.2532 3.61719 31.283C3.61719 33.8837 6.00924 36 8.94528 36H27.0533C29.9894 36 32.3814 33.8837 32.3814 31.283C32.3814 31.2532 32.3814 31.2308 32.3814 31.201ZM17.9993 1.78845C20.8981 1.78845 23.2529 4.14324 23.2603 7.04202H12.7383C12.7457 4.14324 15.1005 1.78845 17.9993 1.78845ZM27.0533 34.2041H8.94528C7.00779 34.2041 5.42799 32.9149 5.40564 31.3128L7.40274 8.83047H10.9498V11.9677C10.9498 12.4595 11.3522 12.8619 11.8441 12.8619C12.3359 12.8619 12.7383 12.4595 12.7383 11.9677V8.83047H23.2603V11.9677C23.2603 12.4595 23.6627 12.8619 24.1546 12.8619C24.6464 12.8619 25.0488 12.4595 25.0488 11.9677V8.83047H28.5959L30.593 31.3202C30.5706 32.9149 28.9908 34.2041 27.0533 34.2041Z" fill="#007048"/>
<path d="M21.7168 18.6148L16.4409 23.8907L14.2873 21.7371C13.9371 21.3869 13.3707 21.3869 13.0205 21.7371C12.6703 22.0873 12.6703 22.6537 13.0205 23.0039L15.8075 25.7909C15.9789 25.9623 16.2099 26.0517 16.4409 26.0517C16.6719 26.0517 16.8955 25.9623 17.0743 25.7909L22.9836 19.8816C23.3339 19.5313 23.3339 18.965 22.9836 18.6148C22.6334 18.272 22.0671 18.272 21.7168 18.6148Z" fill="#007048"/>
</svg>

                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 font-poppins mb-1">
                        100% Sucure Payment
                      </h3>
                      <p className="text-sm text-gray-500 font-poppins">
                        We ensure your money is save
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* We Delivered Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 font-poppins leading-tight mb-6"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.04 }}
                >
                  Our product range includes:
                </motion.h2>
                <motion.p
                  className="text-gray-600 font-poppins leading-relaxed text-base"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.8, type: "spring", stiffness: 80 }}
                  viewport={{ once: true }}
                >
                           </motion.p>
              </div>

              {/* Check list */}
              <div className="space-y-4">
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                    Organic Staples: Pulses, Grains, and Spices.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   Natural Wellness: Herbs, Health Supplements, and Organic Tea.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                    Organic Personal Care: Skincare and Lifestyle products free from harmful chemicals.
                  </p>
                </div>


                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   	Cold Pressed Oils – Extracted using traditional methods to retain natural nutrients and flavor 
                  </p>
                </div>



                 <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   Honey – Pure, unprocessed, and packed with natural goodness 
                  </p>
                </div>  



                 <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   	Jaggery & Natural Sweeteners – Healthy alternatives to refined sugar 
                  </p>
                </div>




                 <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   	Millets – Nutritious ancient grains for a balanced lifestyle 
                  </p>
                </div>
                 <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   	Premium Dates & Dry Fruits – Premium quality for energy and wellness 
                  </p>
                </div>

                 <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-gray-600 font-poppins text-base">
                   Superfoods – Carefully selected nutrient-rich foods for modern health needs 
                  </p>
                </div>

              </div>
              

              {/* Shop Now Button */}
              <div>
                <Link
                  to="/shop"
                  className="bg-[#007048] hover:bg-[#005a3a] text-white px-8 py-4 rounded-full font-semibold font-poppins transition inline-flex items-center gap-2"
                >
                  Shop Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </Link>
                
                
              </div>

              <section>
                <p className="text-gray-700 font-poppins text-base">
                At Arogya Adarsh, we believe that good health starts with good food. That&apos;s why we focus on quality sourcing, minimal processing, and maintaining the natural integrity of every product we offer.  
                </p>
                
              </section>

              <section>
                <p className="text-gray-700 font-poppins text-base">
                Whether you are embracing a healthier lifestyle or looking for trusted everyday essentials, Arogya Adarsh is your partner in wellness, delivering purity, tradition, and nutrition in every pack.       
                </p>
                
              </section>
              
            </div>
            

            {/* Right Image */}
            <motion.div
              className="hidden md:flex relative flex justify-center lg:justify-center"
              initial={{ opacity: 0, scale: 0.85, rotate: 8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.04, rotate: -2, boxShadow: "0px 8px 32px #00704833" }}
            >
              <div className="w-full max-w-[400px] h-[400px] rounded-lg overflow-hidden shadow-2xl">
                <motion.img
                  src={deliveryImage}
                  alt="Organic products"
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 1, type: "spring" }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.07, filter: "brightness(1.08)" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      


<section className="py-16 ">
  <div className="max-w-6xl mx-auto px-2">
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full p-8">
      <form onSubmit={handleCommentSubmit}>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <img
              src="https://www.w3schools.com/howto/img_avatar.png"
              alt="avatar"
              className="w-16 h-16 rounded-full border border-gray-300"
            />
          </div>
          {/* Textarea with stars above */}
          <div className="flex-1">
            {/* Stars above textarea */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-6 h-6 cursor-pointer transition ${star <= rating ? 'fill-yellow-400' : 'fill-gray-200'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>


           
                  <input
  type="text"
  placeholder="Your Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full px-4 py-3 mb-4 border border-blue-200 rounded-lg text-base font-poppins focus:outline-none focus:border-blue-400 shadow-sm transition"
/>


            <textarea
              rows="5"
              placeholder="Write a message..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg text-base font-poppins focus:outline-none focus:border-blue-400 resize-none shadow-sm transition"
              style={{ minHeight: "100px" }}
            />
            <button
              type="submit"
              className="mt-4 bg-[#007048] text-white px-6 py-2 rounded font-poppins font-medium hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</section>


    </div>
  );
}
