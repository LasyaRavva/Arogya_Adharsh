import { useWishlist } from '../context/WishlistContext';

export default function WishlistNotification() {
  const { notification } = useWishlist();

  if (!notification) return null;

  return (
    <div className="fixed top-36 right-4 z-50 animate-slide-in">
      <div className="bg-white text-[#007048] px-3 py-2 rounded-lg shadow-lg flex items-center gap-3 font-poppins">
        <svg className="w-5 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="font-medium">{notification}</span>
      </div>
    </div>
  );
}
