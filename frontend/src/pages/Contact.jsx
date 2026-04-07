import React, { useState } from "react";
import { API_BASE_URL } from '../config';

export default function Contact() {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');

  // const handleCommentSubmit = (e) => {
  //   e.preventDefault();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 md:py-16">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-900 font-poppins text-center mb-8 md:mb-12">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start w-full h-auto">
          {/* Left Form Card - Green - Wider & more padded on tablet */}
          <div className="bg-[#007048] rounded-xl p-6 md:p-12 lg:p-14 h-auto lg:h-[650px] w-full md:w-[60%] lg:w-full shadow-lg">
            <h2 className="text-white text-lg md:text-xl font-semibold font-poppins mb-6 md:mb-8">
              Let’s connect
            </h2>

            <form className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm text-white/90 font-poppins mb-1.5 md:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Projectile helps you"
                  className="w-full bg-transparent border border-white/30 text-white placeholder:text-white/60 rounded-full px-4 py-3 text-sm md:text-base outline-none"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm text-white/90 font-poppins mb-1.5 md:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Projectile helps you"
                  className="w-full bg-transparent border border-white/30 text-white placeholder:text-white/60 rounded-full px-4 py-3 text-sm md:text-base outline-none"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm text-white/90 font-poppins mb-1.5 md:mb-2">
                  Phone Number
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="tel"
                    placeholder="Projectile helps you"
                    className="flex-1 bg-transparent border border-white/30 text-white placeholder:text-white/60 rounded-full px-4 py-3 text-sm md:text-base outline-none"
                  />
                  <select className="bg-[#EAD8B5] text-[#0B5F3F] rounded-full px-4 py-3 text-xs md:text-sm font-semibold outline-none min-w-[60px]">
                    <option>IN</option>
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  rows="4"
                  placeholder="Projectile helps you"
                  className="w-full bg-transparent border border-white/30 text-white placeholder:text-white/60 rounded-2xl px-4 py-3 text-sm md:text-base outline-none resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#EAD8B5] text-[#0B5F3F] px-6 md:px-8 py-3 rounded-full text-sm md:text-base font-semibold font-poppins hover:bg-[#d9c39a] transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>

          {/* Right Info - Text + Smaller Map */}
          <div className="space-y-6 md:space-y-8 lg:space-y-14">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 font-poppins mb-3 md:mb-4">
                Projectile helps
              </h2>
              <p className="text-gray-600 font-poppins text-sm md:text-base leading-relaxed">
                Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. 
                Phasellus imperdiet elit eu magna dictum, bibendum cursus
              </p>
            </div>

            <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700 font-poppins">
              <p>999XXXXXXXX</p>
              <p>lorem@gmail.com</p>
              <p>Monday to Friday 09:00 AM to 06:00 PM</p>
            </div>

            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.885050846934!2d77.59456297518512!3d12.971598790855273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c4e0f3b9%3A0x9194e5a2b2f0b19!2sMG%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1708430000000!5m2!1sen!2sin"
                width="100%"
                height="180"
                className="md:h-[230px] lg:h-[320px]"  // smaller on tablet/small desktop
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Comment / Rating Section */}
        <section className="py-10 md:py-16 -mb-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full p-6 md:p-8">
              <form onSubmit={handleCommentSubmit}>
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <img
                      src="https://www.w3schools.com/howto/img_avatar.png"
                      alt="avatar"
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-gray-300"
                    />
                  </div>

                  {/* Textarea + Stars */}
                  <div className="flex-1 w-full">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-7 h-7 md:w-8 md:h-8 cursor-pointer transition ${star <= rating ? 'fill-yellow-400' : 'fill-gray-200'}`}
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
                      style={{ minHeight: "120px" }}
                    />

                    <button
                      type="submit"
                      className="mt-4 bg-[#007048] text-white px-6 py-3 rounded font-poppins font-medium hover:bg-[#005a3c] transition"
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
    </div>
  );
}

