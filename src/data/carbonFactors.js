// Approximate grams CO2e per passenger-km, based on published UK
// government greenhouse gas conversion factor ranges (illustrative,
// rounded for clarity — not a substitute for the official DEFRA tables).
export const CARBON_FACTORS_G_PER_KM = {
  bus: 105,
  rail: 41,
  cycle: 0,
  walk: 0,
};

export function estimateEmissionsGrams(modeId, distanceKm) {
  const factor = CARBON_FACTORS_G_PER_KM[modeId];
  if (factor === undefined) return null;
  return factor * distanceKm;
}
