import { useCart } from '../context/CartContext';

export default function Notification() {
  const { notification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed top-24 right-4 z-50 animate-slide-in">
      <div className="bg-white text-[#007048] px-3 py-2 rounded-lg shadow-lg flex items-center gap-3 font-poppins">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium">{notification}</span>
      </div>
    </div>
  );
}
