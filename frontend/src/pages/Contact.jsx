import React, { useContext, useEffect, useState } from "react";
import { API_BASE_URL } from '../config';
import { CountryContext } from '../context/CountryContext';

const CONTACT_MAP_URL = 'https://www.google.com/maps/place/Level-Up+Drive-in/@17.4543866,78.2985895,3a,32.8y,149.35h,106.22t/data=!3m7!1e1!3m5!1stUY4Z_2nWAOWRjjvKnLmew!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-16.217699115064832%26panoid%3DtUY4Z_2nWAOWRjjvKnLmew%26yaw%3D149.35339800563403!7i16384!8i8192!4m14!1m7!3m6!1s0x3bcb93f14418e7ef:0xf38bb08bf0a2d9f0!2sLevel-Up+Drive-in!8m2!3d17.454249!4d78.2983664!16s%2Fg%2F11twhz4nsk!3m5!1s0x3bcb93f14418e7ef:0xf38bb08bf0a2d9f0!8m2!3d17.454249!4d78.2983664!16s%2Fg%2F11twhz4nsk?entry=ttu&g_ep=EgoyMDI2MDQwNS4wIKXMDSoASAFQAw%3D%3D';
const CONTACT_MAP_EMBED_URL = 'https://www.google.com/maps?q=17.454249,78.2983664&z=17&output=embed';

export default function Contact() {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [phoneCountryId, setPhoneCountryId] = useState('');
  const { countries, selectedCountry } = useContext(CountryContext);

  useEffect(() => {
    if (!countries.length) return;

    setPhoneCountryId((current) => {
      if (current) return current;
      return String(selectedCountry?.country_id || countries[0].country_id);
    });
  }, [countries, selectedCountry]);

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
                  <select
                    value={phoneCountryId}
                    onChange={(e) => setPhoneCountryId(e.target.value)}
                    className="bg-[#EAD8B5] text-[#0B5F3F] rounded-full px-4 py-3 text-xs md:text-sm font-semibold outline-none min-w-[80px]"
                  >
                    {countries.length === 0 ? (
                      <option value="">Loading...</option>
                    ) : (
                      countries.map((country) => (
                        <option key={country.country_id} value={country.country_id}>
                          {country.code}
                        </option>
                      ))
                    )}
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
                Address
              </h2>
            

            <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700 font-poppins">
              <p><span className="font-bold">Mobile Number:  </span>+91 85198 14763</p>
              <p><span className="font-bold">Address:   </span>Level up Drive-in, Survey # 289 Opposite to VAJRAM ASTER HOME, Gopanapalli, near Honor Vivanta, Tanda, Serilingampalle (M), Hyderabad, Telangana 500046</p>
              <p><span className="font-bold">Operating Hours: </span>Monday to Friday 09:00 AM to 06:00 PM</p>
              <a
                href={CONTACT_MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-[#007048] font-semibold hover:text-[#005a3c] transition"
              >
                Open in Google Maps
              </a>
            </div>
          </div>

            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="Level Up Drive-in map"
                src={CONTACT_MAP_EMBED_URL}
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

