import { useLoyalty } from "../context/LoyaltyContext";
import type { LoyaltyTier } from "../types";

const LoyaltySection = () => {
  const { userLoyaltyTier, setUserLoyaltyTier } = useLoyalty();

  const tiers: LoyaltyTier[] = ["None", "Silver", "Gold"];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Select Loyalty Tier
      </h2>
      <div className="flex items-center gap-3">
        <select
          value={userLoyaltyTier}
          onChange={(e) => setUserLoyaltyTier(e.target.value as LoyaltyTier)}
          className="px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {tiers.map((tier) => (
            <option key={tier} value={tier}>
              {tier}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          Current: <strong>{userLoyaltyTier}</strong>
        </span>
      </div>
    </div>
  );
};

export default LoyaltySection;
