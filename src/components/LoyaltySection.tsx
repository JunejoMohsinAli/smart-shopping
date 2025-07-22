import React from "react";
import { useLoyalty } from "../context/LoyaltyContext";
import type { LoyaltyTier } from "../types";
import { Medal } from "lucide-react";

const tierDetails: Record<
  LoyaltyTier,
  { label: string; color: string; icon: React.ReactNode }
> = {
  Bronze: {
    label: "Bronze",
    color: "text-orange-500",
    icon: <Medal className="inline w-4 h-4 mr-1 text-orange-500" />,
  },
  Silver: {
    label: "Silver",
    color: "text-blue-500",
    icon: <Medal className="inline w-4 h-4 mr-1 text-blue-500" />,
  },
  Gold: {
    label: "Gold",
    color: "text-yellow-500",
    icon: <Medal className="inline w-4 h-4 mr-1 text-yellow-500" />,
  },
};

const tiers: LoyaltyTier[] = ["Bronze", "Silver", "Gold"];

const LoyaltySection = () => {
  const { userLoyaltyTier, setUserLoyaltyTier } = useLoyalty();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <Medal className="w-5 h-5 text-orange-500" /> Select Loyalty Tier
      </h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full max-w-xs">
          <select
            value={userLoyaltyTier}
            onChange={(e) => setUserLoyaltyTier(e.target.value as LoyaltyTier)}
            className="appearance-none w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-base font-medium bg-white text-gray-800 transition-all"
            style={{ paddingRight: "2.5rem" }}
          >
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tierDetails[tier].label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            ▼
          </span>
        </div>
        <span
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${tierDetails[userLoyaltyTier].color} border-gray-200 bg-gray-100`}
        >
          {tierDetails[userLoyaltyTier].icon}
          {tierDetails[userLoyaltyTier].label}
        </span>
      </div>
    </div>
  );
};

export default LoyaltySection;
