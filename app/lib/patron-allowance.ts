import { supabase } from "./supabase";

export type AllowanceResult = {
  balance: number;
  awarded: boolean;
  amount: number;
  welcomed: boolean;
};

const claims = new Map<string, Promise<AllowanceResult | null>>();

function phoenixDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function claimPatronAllowance(userId: string) {
  const key = `${userId}:${phoenixDate()}`;
  const existing = claims.get(key);
  if (existing) return existing;

  const claim = supabase.rpc("claim_daily_allowance").then(({ data, error }) => {
    if (error) throw error;
    return (data?.[0] || null) as AllowanceResult | null;
  });
  claims.set(key, claim);
  claim.catch(() => claims.delete(key));
  return claim;
}
