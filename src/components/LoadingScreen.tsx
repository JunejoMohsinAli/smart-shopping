import { Loader2 } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <div className="text-lg font-medium text-gray-700">
        Loading your cart...
      </div>
      <div className="text-sm text-gray-500 mt-2">This won't take long</div>
    </div>
  );
};

export default LoadingScreen;
