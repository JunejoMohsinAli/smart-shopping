import type { LoyaltyTier } from "../types/Loyalty";
import { isPeakHour } from "../utils/pricing";
import { Crown, Clock, Package, Gift } from "lucide-react";

interface LoyaltySectionProps {
  userLoyaltyTier: LoyaltyTier;
  onTierChange: (tier: LoyaltyTier) => void;
}

const LoyaltySection = ({
  userLoyaltyTier,
  onTierChange,
}: LoyaltySectionProps) => {
  const tierMessages: Record<LoyaltyTier, string> = {
    Bronze: "🥉 Bronze Tier: 5% off",
    Silver: "🥈 Silver Tier: 10% off",
    Gold: "🥇 Gold Tier: 15% off",
    None: "",
  };

  const getTierColor = (tier: LoyaltyTier) => {
    switch (tier) {
      case "Gold":
        return "from-yellow-400 to-orange-500";
      case "Silver":
        return "from-gray-400 to-gray-600";
      case "Bronze":
        return "from-orange-600 to-red-600";
      default:
        return "from-gray-300 to-gray-400";
    }
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Loyalty Tier Selector */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Loyalty Program</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label htmlFor="tier" className="text-sm font-medium text-gray-700">
            Select Your Tier:
          </label>
          <div className="relative">
            <select
              id="tier"
              value={userLoyaltyTier}
              onChange={(e) => onTierChange(e.target.value as LoyaltyTier)}
              className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="None">No Tier</option>
              <option value="Bronze">🥉 Bronze Member</option>
              <option value="Silver">🥈 Silver Member</option>
              <option value="Gold">🥇 Gold Member</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {userLoyaltyTier !== "None" && (
            <div
              className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getTierColor(
                userLoyaltyTier
              )} text-white font-medium shadow-lg`}
            >
              {tierMessages[userLoyaltyTier]}
            </div>
          )}
        </div>
      </div>

      {/* Active Discounts */}
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-blue-200/50">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-blue-600" />
          Active Discounts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loyalty Discount */}
          {tierMessages[userLoyaltyTier] && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getTierColor(
                    userLoyaltyTier
                  )} flex items-center justify-center shadow-lg`}
                >
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {tierMessages[userLoyaltyTier]}
                  </p>
                  <p className="text-sm text-gray-600">Loyalty reward active</p>
                </div>
              </div>
            </div>
          )}

          {/* Peak Hour */}
          {isPeakHour() && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-red-200/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-red-700">Peak Hour: +10%</p>
                  <p className="text-sm text-gray-600">9 AM – 6 PM</p>
                </div>
              </div>
            </div>
          )}

          {/* Volume Discount */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-700">Volume Discounts</p>
                <p className="text-sm text-gray-600">
                  5% off (3+), 10% off (5+)
                </p>
              </div>
            </div>
          </div>

          {/* Category Promotion */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-purple-700">Category Special</p>
                <p className="text-sm text-gray-600">
                  Buy 2 electronics, get accessory 50% off
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySection;
