import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signupImg from '../assets/signin_img.png';
import signupImg1 from '../assets/signin_img1.png';
import { API_BASE_URL } from '../config';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const parseApiResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return { error: text || 'Unexpected server response' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('customer', JSON.stringify(data.customer));
      window.dispatchEvent(new Event('auth-changed'));

      // Navigate to home and reload to update navbar
      window.location.href = '/home';
    } catch (err) {
      setError('Error connecting to server');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 font-poppins">Sign Up</h1>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="bg-[#007048] p-8 lg:p-10 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold text-white mb-6 font-poppins">Welcome</h2>
              
              {error && (
                <div className="bg-red-100/20 border border-red-300 text-red-200 px-4 py-2 rounded-md mb-4 text-sm font-poppins">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white text-xs mb-2 font-poppins">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-xs mb-2 font-poppins">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-xs mb-2 font-poppins">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                    required
                  />
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <p className="text-white text-xs font-poppins">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/signin')}
                      className="underline hover:text-white/80 font-semibold"
                    >
                      Sign In
                    </button>
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#E8DCC8] text-gray-900 font-semibold px-8 py-2 rounded-full hover:bg-[#d9cdb9] transition-colors font-poppins text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side - Images */}
            <div className="bg-[#E8DCC8] relative overflow-hidden flex items-center justify-center">
              <img
                src={signupImg}
                alt="Healthy Food"
                className="absolute left-[28%] top-[58%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] object-contain"
                style={{ transform: 'translate(-50%, -50%) rotate(-180deg)' }}
              />
              <img
                src={signupImg1}
                alt="Olive Oil"
                className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[200px] h-[400px] object-contain"
                style={{ transform: 'translateY(-50%) rotate(-15deg)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
