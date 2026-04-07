import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import organicOil from '../assets/organic oil.jpg';
import coconutOil from '../assets/coconut oils.jpg';
import oilsImage from '../assets/oils.jpg';
import authorImage from '../assets/author1.png';
import { API_BASE_URL } from '../config';

export default function BlogDetail() {
  const { id } = useParams();

  // ── States for real data from database ────────────────────────────────
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveBlogMedia = (value) => {
    if (!value) return "";
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  // ── Fetch only title, authorname, description from backend ────────────
  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/blogs/${id}`);
        setBlog(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Blog detail fetch error:', err);
        setError('Failed to load blog details');
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [id]);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/blogs`);
        const latest = (response.data || [])
          .filter((item) => String(item.id) !== String(id))
          .slice(0, 3);
        setRecentBlogs(latest);
      } catch {
        setRecentBlogs([]);
      }
    };

    fetchRecentBlogs();
  }, [id]);

  // ── Carousel logic (same as before) ───────────────────────────────────
  const dbImages = [
    resolveBlogMedia(blog?.image1),
    resolveBlogMedia(blog?.image2),
    resolveBlogMedia(blog?.image3),
  ].filter(Boolean);

  const carouselImages = dbImages.length > 0 ? dbImages : [organicOil, coconutOil];
  const [carouselIndex, setCarouselIndex] = React.useState(0);

  const _handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };
  const _handleNext = () => {
    setCarouselIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 1000); // Change image every 1 second
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  React.useEffect(() => {
    setCarouselIndex(0);
  }, [id, carouselImages.length]);

  // ── Gallery images (same as before) ───────────────────────────────────
  const galleryImages = dbImages.length > 0
    ? [...dbImages, ...dbImages, ...dbImages].slice(0, 8)
    : [
        organicOil, coconutOil, oilsImage, organicOil,
        coconutOil, oilsImage, organicOil, coconutOil
      ];

  const formatRecentDate = (value) => {
    if (!value) return '';
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-medium text-gray-700">Loading blog...</p>
      </div>
    );
  }

  // ── Error / Not found state ───────────────────────────────────────────
  if (error || !blog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600">Blog not found</h2>
      </div>
    );
  }

  // ── Main render (same layout as your original code) ───────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">

        {/* ================= MOBILE LAYOUT ================= */}
        <div className="block lg:hidden space-y-8">

          {/* Hero Image – static */}
          <div className="w-full h-72 rounded-xl overflow-hidden shadow-md">
            {/* <img
              src={organicOil}
              alt={blog.title}
              className="w-full h-full object-cover"
            /> */}

          <img
  src={resolveBlogMedia(blog.image1) || organicOil}
  alt={blog.title || "Blog Hero Image"}
  className="w-full h-full object-cover"
/>

          </div>

          {/* Main Content */}
          <div>
            {/* Meta Information – category static */}
            <div className="flex items-center gap-4 text-sm font-poppins mb-4">
              <span className="text-[#007048] font-medium flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                  <path d="M17.1596 11.1751L11.1846 17.1501C11.0298 17.305 10.846 17.428 10.6437 17.5118C10.4414 17.5957 10.2245 17.6389 10.0055 17.6389C9.78644 17.6389 9.56957 17.5957 9.36724 17.5118C9.16491 17.428 8.98109 17.305 8.8263 17.1501L1.66797 10.0001V1.66675H10.0013L17.1596 8.82508C17.4701 9.13735 17.6443 9.55977 17.6443 10.0001C17.6443 10.4404 17.4701 10.8628 17.1596 11.1751V11.1751Z" stroke="#007048" strokeWidth="1.2"/>
                </svg>
                Food
              </span>
              <span className="text-gray-600 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M9.99935 9.16667C11.8403 9.16667 13.3327 7.67428 13.3327 5.83333C13.3327 3.99238 11.8403 2.5 9.99935 2.5C8.1584 2.5 6.66602 3.99238 6.66602 5.83333C6.66602 7.67428 8.1584 9.16667 9.99935 9.16667Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                </svg>
                By <span className="font-medium text-gray-900">{blog.authorname}</span>
              </span>
              <span className="text-gray-600 flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M10.5238 13.7728L9.48206 15.5087C9.43209 15.592 9.36139 15.6609 9.27687 15.7088C9.19234 15.7566 9.09686 15.7818 8.99972 15.7818C8.90258 15.7818 8.8071 15.7566 8.72257 15.7088C8.63804 15.6609 8.56735 15.592 8.51738 15.5087L7.47675 13.7728C7.42671 13.6895 7.35596 13.6206 7.27138 13.5728C7.1868 13.525 7.09128 13.4999 6.99413 13.5H2.8125C2.66332 13.5 2.52024 13.4407 2.41475 13.3352C2.30926 13.2298 2.25 13.0867 2.25 12.9375V3.9375C2.25 3.78832 2.30926 3.64524 2.41475 3.53975C2.52024 3.43426 2.66332 3.375 2.8125 3.375H15.1875C15.3367 3.375 15.4798 3.43426 15.5852 3.53975C15.6907 3.64524 15.75 3.78832 15.75 3.9375V12.9375C15.75 13.0867 15.6907 13.2298 15.5852 13.3352C15.4798 13.4407 15.3367 13.5 15.1875 13.5H11.0059C10.9088 13.5 10.8134 13.5252 10.7289 13.573C10.6445 13.6208 10.5738 13.6896 10.5238 13.7728V13.7728Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                </svg>
                65 Comments
              </span>
            </div>

            {/* Blog Title – now dynamic */}
            <h1 className="text-2xl font-medium font-poppins text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center justify-between py-6 border-b border-gray-200 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={authorImage} alt={blog.authorname} className="w-full h-full object-cover"/>
                </div>
                <div>
                  <h3 className="text-sm font-semibold font-poppins text-gray-900">{blog.authorname}</h3>
                  <p className="text-xs text-gray-600 font-poppins">
                    April 4, 2026 • 6 min read
                  </p>
                </div>
              </div>
            </div>

            {/* Blog Description – now dynamic */}
            {blog.description && (
              <div className="mb-6 text-lg text-gray-700 font-poppins leading-relaxed">
                {blog.description}
              </div>
            )}

            {/* Blog Content (static) */}
            <div className="prose prose-lg max-w-none font-poppins text-gray-700 leading-relaxed">
              {/* <p>Maecenas lacinia felis nec placerat sollicitudin. Quisque placerat dolor at scelerisque imperdiet. Phasellus tristique felis dolor. Maecenas elementum in risus sed condimentum. Duis commodo ante eu tempus dignissim. Etiam non tempus mi. Fusce interdum mi ut nulla volutpat, non ornare nunc finibus. Fusce tristique lorem nec elementum convallis. Donec consequat dui ac iaculis efficitur. Nulla facilisi. Sed rutrum tempor dolor, quis facilisis orci varius eget. Sed vulputate sed odio ac tincidunt. Integer non orci nec ante gravida consequat.</p>
              <p className="mt-6">
                Fusce tristique lorem nec elementum convallis. Donec consequat dui ac iaculis efficitur. Nulla facilisi. Sed rutrum tempor dolor, quis facilisis orci varius eget. Sed vulputate sed odio ac tincidunt. Integer non orci nec ante gravida consequat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur tristique velit ac turpis hendrerit, in volutpat mi luctus.
              </p> */}
            </div>

            {/* Carousel Image Gallery */}
            <div className="relative mb-8">
              <div className="overflow-hidden rounded-lg h-64">
                <img
                  src={carouselImages[carouselIndex]}
                  alt={carouselIndex === 0 ? 'Kitchen setup with oils' : 'Oil being poured'}
                  className="w-full h-full object-cover transition duration-300"
                />
              </div>
            </div>

            {/* Content Text */}
            <div className="mb-12">
              {/* <p className="text-gray-700 font-poppins leading-relaxed text-sm mb-6">
                Sed dictum non nulla eu imperdiet. Duis elit libero, vulputate quis vehicula ut, vestibulum ut mauris. Nullam non felis varius dui rutrum rutrum in a nisi. Suspendisse elementum rutrum lorem sed luctus. Proin iaculis euismod metus non sollicitudin. Duis vel luctus lacus. Nullam faucibus iaculis convallis. In ullamcorper nibh ipsum, eget lacinia eros pulvinar a. Integer accumsan arcu nec faucibus ultricies.
              </p> */}
            </div>

            {/* Promotional Banner */}
            <div className="bg-black rounded-lg overflow-hidden mb-12">
              <div className="relative w-full h-64 md:h-80 lg:h-96">
                <img src={oilsImage} alt="Organic oils promotion" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-start">
                  <div className="p-8 text-white">
                    <p className="text-sm font-semibold text-gray-400 mb-2 font-poppins">SUMMER SALES</p>
                    <h2 className="text-4xl font-bold font-poppins mb-6">Organic Oils</h2>
                    <div className="flex items-center gap-2 mb-8">
                      <span className="text-2xl font-bold text-orange-500">UP TO</span>
                      <span className="text-5xl font-bold text-orange-500">56%</span>
                      <span className="text-xl font-semibold">Off</span>
                    </div>
                    <button className="bg-[#007048] hover:bg-[#005a3a] text-white px-6 py-3 rounded font-semibold font-poppins transition">
                      Shop Now →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Gallery and Recently Added */}
          <div className="col-span-1 md:col-span-2 custom-1064:col-span-2 lg:col-span-2 flex flex-col gap-6 mb-48 p-4 md:p-0 custom-1064:p-0 lg:sticky lg:top-10 lg:h-[calc(100vh-80px)] md:static md:h-auto custom-1064:static custom-1064:h-auto">
            {/* Our Gallery */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-4">Our Gallery</h3>
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100 hover:shadow-md transition duration-300 cursor-pointer">
                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-300"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-5">Recently Added</h3>
              <div className="space-y-4">
                {recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={resolveBlogMedia(blog.image1 || blog.image2 || blog.image3) || organicOil} alt={blog.title} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium font-poppins text-gray-900 line-clamp-2 leading-tight mb-1">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-poppins flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        {formatRecentDate(blog.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP LAYOUT ================= */}
        <div className="hidden lg:grid grid-cols-5 gap-8 lg:grid-cols-5 gap-8">
          {/* Left Column - Blog Image and Content */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Blog Image – static */}
            <div className="w-full h-96 bg-gray-100 overflow-hidden rounded-lg">
              {/* <img
                src={organicOil}
                alt={blog.title}
                className="w-full h-full object-cover"
              /> */}


                     <img
  src={resolveBlogMedia(blog.image1) || organicOil}
  alt={blog.title || "Blog Hero Image"}
  className="w-full h-full object-cover"
/>
             

            </div>

            {/* Main Content */}
            <div>
              {/* Meta Information */}
              <div className="flex items-center gap-4 text-sm font-poppins mb-4">
                <span className="text-[#007048] font-medium flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path d="M17.1596 11.1751L11.1846 17.1501C11.0298 17.305 10.846 17.428 10.6437 17.5118C10.4414 17.5957 10.2245 17.6389 10.0055 17.6389C9.78644 17.6389 9.56957 17.5957 9.36724 17.5118C9.16491 17.428 8.98109 17.305 8.8263 17.1501L1.66797 10.0001V1.66675H10.0013L17.1596 8.82508C17.4701 9.13735 17.6443 9.55977 17.6443 10.0001C17.6443 10.4404 17.4701 10.8628 17.1596 11.1751V11.1751Z" stroke="#007048" strokeWidth="1.2"/>
                  </svg>
                  Food
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                    <path d="M9.99935 9.16667C11.8403 9.16667 13.3327 7.67428 13.3327 5.83333C13.3327 3.99238 11.8403 2.5 9.99935 2.5C8.1584 2.5 6.66602 3.99238 6.66602 5.83333C6.66602 7.67428 8.1584 9.16667 9.99935 9.16667Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                  </svg>
                  By <span className="font-medium text-gray-900">{blog.authorname}</span>
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                    <path d="M10.5238 13.7728L9.48206 15.5087C9.43209 15.592 9.36139 15.6609 9.27687 15.7088C9.19234 15.7566 9.09686 15.7818 8.99972 15.7818C8.90258 15.7818 8.8071 15.7566 8.72257 15.7088C8.63804 15.6609 8.56735 15.592 8.51738 15.5087L7.47675 13.7728C7.42671 13.6895 7.35596 13.6206 7.27138 13.5728C7.1868 13.525 7.09128 13.4999 6.99413 13.5H2.8125C2.66332 13.5 2.52024 13.4407 2.41475 13.3352C2.30926 13.2298 2.25 13.0867 2.25 12.9375V3.9375C2.25 3.78832 2.30926 3.64524 2.41475 3.53975C2.52024 3.43426 2.66332 3.375 2.8125 3.375H15.1875C15.3367 3.375 15.4798 3.43426 15.5852 3.53975C15.6907 3.64524 15.75 3.78832 15.75 3.9375V12.9375C15.75 13.0867 15.6907 13.2298 15.5852 13.3352C15.4798 13.4407 15.3367 13.5 15.1875 13.5H11.0059C10.9088 13.5 10.8134 13.5252 10.7289 13.573C10.6445 13.6208 10.5738 13.6896 10.5238 13.7728V13.7728Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                  </svg>
                  65 Comments
                </span>
              </div>

              {/* Blog Title – dynamic */}
              <h1 className="text-2xl font-medium font-poppins text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between py-6 border-b border-gray-200 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={authorImage} alt={blog.authorname} className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-poppins text-gray-900">{blog.authorname}</h3>
                    <p className="text-xs text-gray-600 font-poppins">
                      April 4, 2026 • 6 min read
                    </p>
                  </div>
                </div>
              </div>

              {/* Blog Description – dynamic */}
              {blog.description && (
                <div className="mb-6 text-lg text-gray-700 font-poppins leading-relaxed">
                  {blog.description}
                </div>
              )}

              {/* Blog Content (static) */}
              <div className="prose prose-lg max-w-none font-poppins text-gray-700 leading-relaxed">
                {/* <p>Maecenas lacinia felis nec placerat sollicitudin. Quisque placerat dolor at scelerisque imperdiet. Phasellus tristique felis dolor. Maecenas elementum in risus sed condimentum. Duis commodo ante eu tempus dignissim. Etiam non tempus mi. Fusce interdum mi ut nulla volutpat, non ornare nunc finibus. Fusce tristique lorem nec elementum convallis. Donec consequat dui ac iaculis efficitur. Nulla facilisi. Sed rutrum tempor dolor, quis facilisis orci varius eget. Sed vulputate sed odio ac tincidunt. Integer non orci nec ante gravida consequat.</p>
                <p className="mt-6">
                  Fusce tristique lorem nec elementum convallis. Donec consequat dui ac iaculis efficitur. Nulla facilisi. Sed rutrum tempor dolor, quis facilisis orci varius eget. Sed vulputate sed odio ac tincidunt. Integer non orci nec ante gravida consequat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur tristique velit ac turpis hendrerit, in volutpat mi luctus.
                </p> */}
              </div>

              {/* Two Column Image Gallery */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="overflow-hidden rounded-lg h-64">
                  <img
                    src={carouselImages[0] || organicOil}
                    alt={blog.title || 'Blog image 1'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-lg h-64">
                  <img
                    src={carouselImages[1] || carouselImages[0] || coconutOil}
                    alt={blog.title || 'Blog image 2'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content Text */}
              <div className="mb-12">
                {/* <p className="text-gray-700 font-poppins leading-relaxed text-sm mb-6">
                  Sed dictum non nulla eu imperdiet. Duis elit libero, vulputate quis vehicula ut, vestibulum ut mauris. Nullam non felis varius dui rutrum rutrum in a nisi. Suspendisse elementum rutrum lorem sed luctus. Proin iaculis euismod metus non sollicitudin. Duis vel luctus lacus. Nullam faucibus iaculis convallis. In ullamcorper nibh ipsum, eget lacinia eros pulvinar a. Integer accumsan arcu nec faucibus ultricies.
                </p> */}
              </div>

              {/* Promotional Banner */}
              <div className="bg-black rounded-lg overflow-hidden mb-12">
                <div className="grid grid-cols-2 items-center">
                  <div className="p-8 text-white">
                    <p className="text-sm font-semibold text-gray-400 mb-2 font-poppins">SUMMER SALES</p>
                    <h2 className="text-4xl font-bold font-poppins mb-6">Organic Oils</h2>
                    <div className="flex items-center gap-2 mb-8">
                      <span className="text-2xl font-bold text-orange-500">UP TO</span>
                      <span className="text-5xl font-bold text-orange-500">56%</span>
                      <span className="text-xl font-semibold">Off</span>
                    </div>
                    <button className="bg-[#007048] hover:bg-[#005a3a] text-white px-6 py-3 rounded font-semibold font-poppins transition">
                      Shop Now →
                    </button>
                  </div>
                  <div className="h-full">
                    <img src={oilsImage} alt="Organic oils promotion" className="w-full h-full object-cover"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Gallery and Recently Added */}
          <div className="col-span-1 md:col-span-2 custom-1064:col-span-2 lg:col-span-2 flex flex-col gap-6 mb-48 p-4 md:p-0 custom-1064:p-0 lg:sticky lg:top-10 lg:h-[calc(100vh-80px)] md:static md:h-auto custom-1064:static custom-1064:h-auto">
            {/* Our Gallery */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-4">Our Gallery</h3>
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100 hover:shadow-md transition duration-300 cursor-pointer">
                    <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-300"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Added */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold font-poppins text-gray-900 mb-5">Recently Added</h3>
              <div className="space-y-4">
                {recentBlogs.map((blog) => (
                  <div key={blog.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={resolveBlogMedia(blog.image1 || blog.image2 || blog.image3) || organicOil} alt={blog.title} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium font-poppins text-gray-900 line-clamp-2 leading-tight mb-1">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-poppins flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h12a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        {formatRecentDate(blog.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}