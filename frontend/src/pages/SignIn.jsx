import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import signinImg from '../assets/signin_img.png';
import signinImg1 from '../assets/signin_img1.png';
import { API_BASE_URL } from '../config';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setError(data.error || 'Sign in failed');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('customer', JSON.stringify(data.customer));
      window.dispatchEvent(new Event('auth-changed'));

      const redirectTo = location.state?.from || '/home';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError('Error connecting to server');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await parseApiResponse(response);

      if (!response.ok) {
        setError(data.error || 'Password reset failed');
        return;
      }

      // Success - reset form
      setNewPassword('');
      setEmail('');
      setShowForgotPassword(false);
      alert('Password reset successfully! Please sign in with your new password.');
    } catch (err) {
      setError('Error connecting to server');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 font-poppins">Sign In</h1>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Form */}
            <div className="bg-[#007048] p-8 lg:p-10 flex flex-col justify-center min-h-80">
              {!showForgotPassword ? (
                <>
                  <h2 className="text-2xl font-semibold text-white mb-6 font-poppins">Welcome Back</h2>
                  
                  {error && (
                    <div className="bg-red-100/20 border border-red-300 text-red-200 px-4 py-2 rounded-md mb-4 text-sm font-poppins">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white text-xs mb-1 font-poppins">Email Address</label>
                      <input
                        type="email"
                        placeholder="Projectile helps you"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white text-xs mb-1 font-poppins">Password</label>
                      <input
                        type="password"
                        placeholder="Projectile helps you"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                        required
                      />
                      <div className="text-right mt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowForgotPassword(true)}
                          className="text-white/70 text-xs hover:text-white font-poppins"
                        >
                          Forgot Password ?
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E8DCC8] text-gray-900 font-semibold py-2 rounded-full hover:bg-[#d9cdb9] transition-colors font-poppins text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <p className="text-white text-xs font-poppins">
                        No account?{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/signup')}
                          className="underline hover:text-white/80 font-semibold"
                        >
                          Sign Up
                        </button>
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-white mb-6 font-poppins">Reset Password</h2>
                  
                  {error && (
                    <div className="bg-red-100/20 border border-red-300 text-red-200 px-4 py-2 rounded-md mb-4 text-sm font-poppins">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-white text-xs mb-1 font-poppins">Email Address</label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white text-xs mb-1 font-poppins">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent border border-white/30 rounded-full px-5 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white transition-colors font-poppins"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E8DCC8] text-gray-900 font-semibold py-2 rounded-full hover:bg-[#d9cdb9] transition-colors font-poppins text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowForgotPassword(false);
                        }}
                        className="text-white/70 text-xs hover:text-white font-poppins transition-colors"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Right Side - Images */}
            <div className="bg-[#E8DCC8] relative overflow-hidden flex items-center justify-center">
              <img
                src={signinImg}
                alt="Healthy Food"
                className="absolute left-[28%] top-[70%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] object-contain"
                style={{ transform: 'translate(-50%, -50%) rotate(-180deg)' }}
              />
              <img
                src={signinImg1}
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
