// src/context/LoyaltyContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import type { LoyaltyTier } from "../types";

interface LoyaltyContextType {
  userLoyaltyTier: LoyaltyTier;
  setUserLoyaltyTier: (tier: LoyaltyTier) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userLoyaltyTier, setUserLoyaltyTier] = useState<LoyaltyTier>(() => {
    return (localStorage.getItem("loyaltyTier") as LoyaltyTier) || "None";
  });

  useEffect(() => {
    localStorage.setItem("loyaltyTier", userLoyaltyTier);
  }, [userLoyaltyTier]);

  return (
    <LoyaltyContext.Provider value={{ userLoyaltyTier, setUserLoyaltyTier }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = (): LoyaltyContextType => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error("useLoyalty must be used within a LoyaltyProvider");
  }
  return context;
};
