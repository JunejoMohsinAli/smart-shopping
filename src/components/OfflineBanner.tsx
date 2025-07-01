import { WifiOff } from "lucide-react";

interface OfflineBannerProps {
  isVisible: boolean;
}

const OfflineBanner = ({ isVisible }: OfflineBannerProps) => {
  if (!isVisible) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
      <WifiOff className="inline w-4 h-4 mr-2" />
      You're offline. Some features may not work properly.
    </div>
  );
};

export default OfflineBanner;
