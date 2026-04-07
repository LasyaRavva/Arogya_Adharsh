import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import splash1 from '../assets/splash1.png';
import splash2 from '../assets/splash2.png';
import splash3 from '../assets/splash3.png';
import splash4 from '../assets/splash4.png';
import logo from '../assets/logo1.png';

export default function Splash() {
  const navigate = useNavigate();
  const [animateHands, setAnimateHands] = useState(false);

  useEffect(() => {
    // Start hand animation immediately
    const handTimer = setTimeout(() => {
      setAnimateHands(true);
    }, 10);

    // Navigate to home after animation completes
    const navigationTimer = setTimeout(() => {
      navigate('/home', { replace: true });
    }, 7000);

    return () => {
      clearTimeout(handTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);





  



  return (
    <div className="min-h-screen w-full bg-[#007048] flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .welcome-animate {
          animation: fadeInDown 1.2s ease-out 3.5s forwards;
          opacity: 0;
        }

        .text-animate {
          animation: fadeInUp 1.5s ease-out 3.8s forwards;
          opacity: 0;
        }

        .subtitle-animate {
          animation: fadeIn 1.2s ease-out 4.1s forwards;
          opacity: 0;
        }
      `}</style>
      {/* Main Splash Container */}

      {/* Desktop & Tablet View - Consistent vertical layout */}
      <div className="hidden sm:flex flex-col items-center justify-center w-full h-screen relative">
        {/* Logo at the top */}
        <img
          src={logo}
          alt="Arogya Adharsh Logo"
          className="w-64 h-auto mx-auto mb-8 drop-shadow-2xl"
          style={{ zIndex: 30, pointerEvents: 'none' }}
        />
        {/* Text in the middle */}
        <div className="w-full max-w-xl text-center z-20 pointer-events-none mb-4">
          <p className="text-2xl text-white mb-2 welcome-animate">Welcome to</p>
          <h1 className="text-5xl font-bold text-white mb-3 text-animate">Arogya Adharsh</h1>
          <p className="text-gray-200 text-xl subtitle-animate">Organic Goodness</p>
        </div>
        {/* Hands at the bottom with slide-in animation */}
        <div className="flex flex-row items-center justify-center gap-0 mt-12 mb-4 relative" style={{ minHeight: '90px' }}>
          {/* Left Hand (slide in from left, no negative margin) */}
          <img
            src={splash1}
            alt="Left Hand"
            className="w-32 h-auto object-contain"
            style={{
              minWidth: '90px',
              maxWidth: '130px',
              transform: animateHands ? 'translateX(0)' : 'translateX(-100vw)',
              transition: 'transform 1.5s cubic-bezier(.4,0,.2,1)',
              zIndex: 12
            }}
          />
          {/* Right Hand (slide in from right, no negative margin) */}
          <img
            src={splash2}
            alt="Right Hand"
            className="w-32 h-auto object-contain"
            style={{
              minWidth: '90px',
              maxWidth: '130px',
              transform: animateHands ? 'translateX(0)' : 'translateX(100vw)',
              transition: 'transform 1.5s cubic-bezier(.4,0,.2,1)',
              zIndex: 12
            }}
          />
        </div>
        {/* Mandala Art (optional, can be added as background if needed) */}
        <img
          src={splash4}
          alt="Left Mandala"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-auto object-contain z-10 opacity-80"
        />
        <img
          src={splash3}
          alt="Right Mandala"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-auto object-contain z-10 opacity-80"
        />
      </div>


      {/* Mobile View - Animated hands, mandala art fixed at corners */}
      <div className="sm:hidden flex flex-col items-center justify-start w-full h-screen pt-8 px-4 relative overflow-x-hidden">
        {/* Mandala Art Left (fixed at bottom left corner) */}
        <img
          src={splash4}
          alt="Left Mandala"
          className="absolute"
          style={{
            left: 0,
            bottom: 350,
            width: '80px',
            height: 'auto',
            objectFit: 'contain',
            zIndex: 10
          }}
        />
        {/* Mandala Art Right (fixed at bottom right corner) */}
        <img
          src={splash3}
          alt="Right Mandala"
          className="absolute"
          style={{
            right: 0,
            bottom: 350,
            width: '80px',
            height: 'auto',
            objectFit: 'contain',
            zIndex: 10
          }}
        />
        {/* Logo at the very top */}
        <img
          src={logo}
          alt="Arogya Adharsh Logo"
          className="w-32 h-auto mx-auto drop-shadow-lg mb-2 mt-2"
          style={{ zIndex: 30, pointerEvents: 'none' }}
        />
        {/* Text directly below logo */}
        <div className="w-full max-w-xs text-center z-20 pointer-events-none mb-2">
          <p className="text-base text-white mb-1 welcome-animate break-words">Welcome to</p>
          <h1 className="text-xl font-bold text-white mb-1 text-animate break-words">Arogya Adharsh</h1>
          <p className="text-gray-200 text-sm subtitle-animate break-words">Organic Goodness</p>
        </div>

        {/* Animated Hands (centered, slide in, mobile/tablet, no cross) */}
        <div className="w-full flex flex-col items-center mt-2 relative z-10" style={{ minHeight: '120px' }}>
          {/* Left Hand (slide in from left, mobile/tablet) */}
          <img
            src={splash1}
            alt="Left Hand"
            className="absolute"
            style={{
              left: animateHands ? 'calc(50% - 58px)' : '-120px', // perfectly touch
              top: '40px',
              width: '58px',
              height: 'auto',
              objectFit: 'contain',
              transition: 'left 1.5s cubic-bezier(.4,0,.2,1)',
              zIndex: 12
            }}
          />
          {/* Right Hand (slide in from right, mobile/tablet) */}
          <img
            src={splash2}
            alt="Right Hand"
            className="absolute"
            style={{
              left: animateHands ? '50%' : '100vw', // perfectly touch
              top: '40px',
              width: '58px',
              height: 'auto',
              objectFit: 'contain',
              transition: 'left 1.5s cubic-bezier(.4,0,.2,1)',
              zIndex: 12
            }}
          />
        </div>
      </div>

    </div>
  );
}
