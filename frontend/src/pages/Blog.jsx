// Helper to get the best available image for a blog

function getBlogImage(blog) {
  const resolveBlogMedia = (value) => {
    if (!value) return "";
    if (value.startsWith('data:') || value.startsWith('blob:')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    return `${API_BASE_URL}/${value.replace(/^\/+/, '')}`;
  };

  if (blog.image3) return resolveBlogMedia(blog.image3);
  if (blog.image2) return resolveBlogMedia(blog.image2);
  if (blog.image1) return resolveBlogMedia(blog.image1);
  return "";
}



import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../config';

// Helper to get day/month from either blog.date or blog.created_at
function getBlogDayMonth(blog) {
  if (blog.date && typeof blog.date === 'object') {
    return {
      day: blog.date.day,
      month: blog.date.month
    };
  }
  if (blog.created_at) {
    const dateObj = new Date(blog.created_at);
    const day = dateObj.getDate();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[dateObj.getMonth()];
    return { day, month };
  }
  // fallback
  return { day: '', month: '' };
}

export default function Blog() {
  const [sortBy, setSortBy] = useState('Latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState([]);
  const ITEMS_PER_SECTION = 3;
  const ITEMS_PER_PAGE = ITEMS_PER_SECTION * 2;


  useEffect(() => {
  fetch(`${API_BASE_URL}/api/blogs`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    })
    .then((data) => {
      //  console.log("BLOG DATA:", data);  
      console.log("API se aaya image1 (first blog):", data[0]?.image1);
  console.log("Pura first blog object:", data[0]);
      setBlogs(data);
    })
    .catch((err) => {
      console.error(err);
    });
}, []);






  const handleSort = (value) => {
    setSortBy(value);
  };

  // Memoize sorted blogs based on sortBy filter
  const sortedBlogs = useMemo(() => {
    const blankArray = [...blogs];
    switch (sortBy) {
      case 'Latest':
        return blankArray.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case 'Oldest':
        return blankArray.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      default:
        return blankArray;
    }
  }, [sortBy, blogs]);

  const totalPages = Math.max(1, Math.ceil(sortedBlogs.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * ITEMS_PER_PAGE;
  const featuredBlogs = sortedBlogs.slice(pageStart, pageStart + ITEMS_PER_SECTION);
  const companyBlogs = sortedBlogs.slice(pageStart + ITEMS_PER_SECTION, pageStart + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white py-12 px-3 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold font-poppins text-gray-900 mb-12 text-center">Our Blogs</h1>

        {/* Sort and Results */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-poppins font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-poppins text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007048]"
            >
              <option value="Latest">Latest</option>
              <option value="Oldest">Oldest</option>
              <option value="Popular">Popular</option>
              <option value="Trending">Trending</option>
            </select>
          </div>
          <div className="text-gray-600 font-poppins">
            <span className="font-semibold text-gray-900">{blogs.length}</span> Results Found
          </div>
        </div>

        {/* Featured On Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-8">Featured On</h2>


          {/* ================= MOBILE CAROUSEL ================= */}
  <div className="md:hidden flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth no-scrollbar">

    {featuredBlogs.map((blog) => (
      <div
        key={blog.id}
        className="min-w-[85%] snap-center bg-white border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Image (Smaller for Mobile) */}
        <div className="relative h-36 bg-gray-100">
          <img
  src={getBlogImage(blog)}
  alt={blog.title}
  className="w-full h-full object-cover"
/>





          {/* Date Badge */}
          <div className="absolute top-2 left-2 bg-white rounded-md px-2 py-1 shadow text-center">
            <div className="text-sm font-bold text-gray-900">
              {getBlogDayMonth(blog).day}
            </div>
            <div className="text-[10px] text-gray-600">
              {getBlogDayMonth(blog).month}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {blog.title}
          </h3>

          <a
            href={`/blog/${blog.id}`}
            className="text-[#007048] text-xs font-semibold flex items-center gap-1"
            state={blog}
          >
            Read More →
          </a>
        </div>
      </div>
    ))}
  </div>

          {/* Blog Cards Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBlogs.map((blog) => (
              <div key={blog.id} className="bg-white group border border-gray-200 rounded-lg overflow-hidden">
                {/* Blog Image Container */}
                <div className="relative overflow-hidden rounded-lg mb-3 h-48 bg-gray-100">
                  <img
                    src={getBlogImage(blog)}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />


  



                  {/* Date Badge */}
                  <div className="absolute top-3 left-3 bg-white rounded-lg p-2 shadow-md">
                    <div className="text-center">
                      <div className="text-base font-bold text-gray-900 font-poppins">{getBlogDayMonth(blog).day}</div>
                      <div className="text-xs text-gray-600 font-poppins font-medium">{getBlogDayMonth(blog).month}</div>
                    </div>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="px-3 pb-3">
                  {/* Meta Information */}
                  <div className="flex items-center gap-3 mb-2 text-xs font-poppins">
                    <span className="text-[#007048] font-medium flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path d="M17.1596 11.1751L11.1846 17.1501C11.0298 17.305 10.846 17.428 10.6437 17.5118C10.4414 17.5957 10.2245 17.6389 10.0055 17.6389C9.78644 17.6389 9.56957 17.5957 9.36724 17.5118C9.16491 17.428 8.98109 17.305 8.8263 17.1501L1.66797 10.0001V1.66675H10.0013L17.1596 8.82508C17.4701 9.13735 17.6443 9.55977 17.6443 10.0001C17.6443 10.4404 17.4701 10.8628 17.1596 11.1751V11.1751Z" stroke="#007048" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.83594 5.8335H5.84427" stroke="#007048" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {blog.category}
                    </span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path d="M9.99935 9.16667C11.8403 9.16667 13.3327 7.67428 13.3327 5.83333C13.3327 3.99238 11.8403 2.5 9.99935 2.5C8.1584 2.5 6.66602 3.99238 6.66602 5.83333C6.66602 7.67428 8.1584 9.16667 9.99935 9.16667Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                        <path d="M12.4997 11.6667H7.4997C5.19804 11.6667 3.1372 13.7917 4.65137 15.5242C5.68137 16.7025 7.3847 17.5 9.9997 17.5C12.6147 17.5 14.3172 16.7025 15.3472 15.5242C16.8622 13.7909 14.8005 11.6667 12.4997 11.6667Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                      </svg>
                      By <span className="font-medium text-gray-900">{blog.authorname}</span>
                    </span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path d="M10.5238 13.7728L9.48206 15.5087C9.43209 15.592 9.36139 15.6609 9.27687 15.7088C9.19234 15.7566 9.09686 15.7818 8.99972 15.7818C8.90258 15.7818 8.8071 15.7566 8.72257 15.7088C8.63804 15.6609 8.56735 15.592 8.51738 15.5087L7.47675 13.7728C7.42671 13.6895 7.35596 13.6206 7.27138 13.5728C7.1868 13.525 7.09128 13.4999 6.99413 13.5H2.8125C2.66332 13.5 2.52024 13.4407 2.41475 13.3352C2.30926 13.2298 2.25 13.0867 2.25 12.9375V3.9375C2.25 3.78832 2.30926 3.64524 2.41475 3.53975C2.52024 3.43426 2.66332 3.375 2.8125 3.375H15.1875C15.3367 3.375 15.4798 3.43426 15.5852 3.53975C15.6907 3.64524 15.75 3.78832 15.75 3.9375V12.9375C15.75 13.0867 15.6907 13.2298 15.5852 13.3352C15.4798 13.4407 15.3367 13.5 15.1875 13.5H11.0059C10.9088 13.5 10.8134 13.5252 10.7289 13.573C10.6445 13.6208 10.5738 13.6896 10.5238 13.7728V13.7728Z" stroke="#B3B3B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {blog.comments} Comments
                    </span>
                  </div>

                  {/* Blog Title */}
                  <h3 className="text-sm font font-poppins text-gray-900 mb-2 leading-snug line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Read More Link */}
                  <a
                    href={`/blog/${blog.id}`}
                    className="text-[#007048] font-semibold font-poppins text-xs flex items-center gap-1 hover:gap-2 transition group/link"
                    state={blog}
                  >
                    Read More
                    <svg className="w-4 h-4 group-hover/link:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Blog Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-poppins text-gray-900 mb-8">Company Blog</h2>


 {/* ================= MOBILE CAROUSEL ================= */}
  <div className="md:hidden flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth no-scrollbar">

    {companyBlogs.map((blog) => (
      <div
        key={blog.id}
        className="min-w-[85%] snap-center bg-white border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Image (Smaller for Mobile) */}
        <div className="relative h-36 bg-gray-100">
          <img
            src={getBlogImage(blog)}
            alt={blog.title}
            className="w-full h-full object-cover"
          />

  

          {/* Date Badge */}
          <div className="absolute top-2 left-2 bg-white rounded-md px-2 py-1 shadow text-center">
            <div className="text-sm font-bold text-gray-900">
              {getBlogDayMonth(blog).day}
            </div>
            <div className="text-[10px] text-gray-600">
              {getBlogDayMonth(blog).month}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
            {blog.title}
          </h3>

          <a
            href={`/blog/${blog.id}`}
            className="text-[#007048] text-xs font-semibold flex items-center gap-1"
          >
            Read More →
          </a>
        </div>
      </div>
    ))}
  </div>


          {/* Blog Cards Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyBlogs.map((blog) => (
              <div key={blog.id} className="bg-white group border border-gray-200 rounded-lg overflow-hidden">
                {/* Blog Image Container */}
                <div className="relative overflow-hidden rounded-lg mb-4 h-48 bg-gray-100">
                  <img
                    src={getBlogImage(blog)}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-md">
                    <div className="text-center">
                      <div className="text-base font-bold text-gray-900 font-poppins">{getBlogDayMonth(blog).day}</div>
                      <div className="text-xs text-gray-600 font-poppins font-medium">{getBlogDayMonth(blog).month}</div>
                    </div>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="px-3 pb-3">
                  {/* Meta Information */}
                  <div className="flex items-center gap-3 mb-2 text-xs font-poppins">
                    <span className="text-[#007048] font-medium flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path d="M17.1596 11.1751L11.1846 17.1501C11.0298 17.305 10.846 17.428 10.6437 17.5118C10.4414 17.5957 10.2245 17.6389 10.0055 17.6389C9.78644 17.6389 9.56957 17.5957 9.36724 17.5118C9.16491 17.428 8.98109 17.305 8.8263 17.1501L1.66797 10.0001V1.66675H10.0013L17.1596 8.82508C17.4701 9.13735 17.6443 9.55977 17.6443 10.0001C17.6443 10.4404 17.4701 10.8628 17.1596 11.1751V11.1751Z" stroke="#007048" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.83594 5.8335H5.84427" stroke="#007048" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {blog.category}
                    </span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path d="M9.99935 9.16667C11.8403 9.16667 13.3327 7.67428 13.3327 5.83333C13.3327 3.99238 11.8403 2.5 9.99935 2.5C8.1584 2.5 6.66602 3.99238 6.66602 5.83333C6.66602 7.67428 8.1584 9.16667 9.99935 9.16667Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                        <path d="M12.4997 11.6667H7.4997C5.19804 11.6667 3.1372 13.7917 4.65137 15.5242C5.68137 16.7025 7.3847 17.5 9.9997 17.5C12.6147 17.5 14.3172 16.7025 15.3472 15.5242C16.8622 13.7909 14.8005 11.6667 12.4997 11.6667Z" stroke="#B3B3B3" strokeWidth="1.2"/>
                      </svg>
                      By <span className="font-medium text-gray-900">{blog.author}</span>
                    </span>
                    <span className="text-gray-600 flex items-center gap-1">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                        <path d="M10.5238 13.7728L9.48206 15.5087C9.43209 15.592 9.36139 15.6609 9.27687 15.7088C9.19234 15.7566 9.09686 15.7818 8.99972 15.7818C8.90258 15.7818 8.8071 15.7566 8.72257 15.7088C8.63804 15.6609 8.56735 15.592 8.51738 15.5087L7.47675 13.7728C7.42671 13.6895 7.35596 13.6206 7.27138 13.5728C7.1868 13.525 7.09128 13.4999 6.99413 13.5H2.8125C2.66332 13.5 2.52024 13.4407 2.41475 13.3352C2.30926 13.2298 2.25 13.0867 2.25 12.9375V3.9375C2.25 3.78832 2.30926 3.64524 2.41475 3.53975C2.52024 3.43426 2.66332 3.375 2.8125 3.375H15.1875C15.3367 3.375 15.4798 3.43426 15.5852 3.53975C15.6907 3.64524 15.75 3.78832 15.75 3.9375V12.9375C15.75 13.0867 15.6907 13.2298 15.5852 13.3352C15.4798 13.4407 15.3367 13.5 15.1875 13.5H11.0059C10.9088 13.5 10.8134 13.5252 10.7289 13.573C10.6445 13.6208 10.5738 13.6896 10.5238 13.7728V13.7728Z" stroke="#B3B3B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {blog.comments} Comments
                    </span>
                  </div>

                  {/* Blog Title */}
                  <h3 className="text-sm font font-poppins text-gray-900 mb-2 leading-snug line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Read More Link */}
                  <a
                    href={`/blog/${blog.id}`}
                    className="text-[#007048] font-semibold font-poppins text-xs flex items-center gap-1 hover:gap-2 transition group/link"
                  >
                    Read More
                    <svg className="w-4 h-4 group-hover/link:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPageSafe - 1))}
            disabled={currentPageSafe === 1}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-full font-semibold font-poppins flex items-center justify-center transition ${
                currentPageSafe === page
                  ? 'bg-[#007048] text-white'
                  : 'border border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPageSafe + 1))}
            disabled={currentPageSafe === totalPages}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
