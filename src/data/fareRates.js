// Simple, transparent per-km rules used by the fare estimator and
// journey comparison tool. Rates are illustrative, based on typical
// UK urban fare bands, not a live pricing feed.
export const FARE_RATES = {
  bus: { ratePerKm: 0.5, base: 0, label: 'Bus' },
  rail: { ratePerKm: 0.9, base: 0.5, label: 'Rail' },
  cycle: { ratePerKm: 0.1, base: 0, label: 'Cycling (hire bike)' },
  walk: { ratePerKm: 0, base: 0, label: 'Walking' },
};

export function estimateFare(modeId, distanceKm) {
  const rate = FARE_RATES[modeId];
  if (!rate || distanceKm <= 0) return null;
  const cost = rate.base + rate.ratePerKm * distanceKm;
  // Present as a range to reflect real-world fare-banding uncertainty.
  return {
    low: Math.max(0, cost * 0.9),
    high: cost * 1.15,
    mid: cost,
  };
}

export function estimateTimeHours(modeId, distanceKm, avgSpeedKmh) {
  if (!avgSpeedKmh) return null;
  return distanceKm / avgSpeedKmh;
}
