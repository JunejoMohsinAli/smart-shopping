import { ShoppingCart, Wifi, WifiOff, Sparkles } from "lucide-react";

interface HeaderProps {
  isOnline: boolean;
  totalItemsInCart: number;
  onCartToggle: () => void;
}

const Header = ({ isOnline, totalItemsInCart, onCartToggle }: HeaderProps) => {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Shopping
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Intelligent E-commerce
                </p>
              </div>
            </div>

            {/* Connection Indicator */}
            <div className="flex items-center">
              {isOnline ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={onCartToggle}
            className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ShoppingCart size={20} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline font-medium">Cart</span>
            {totalItemsInCart > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {totalItemsInCart}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
