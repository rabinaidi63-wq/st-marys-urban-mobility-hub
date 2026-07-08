// Thin wrapper around the TfL Unified API (https://api.tfl.gov.uk).
// Works unauthenticated at a modest shared rate limit; set
// VITE_TFL_APP_KEY in .env to use a personal free key for reliable
// testing (see .env.example / README).
const BASE_URL = 'https://api.tfl.gov.uk';
const APP_KEY = import.meta.env.VITE_TFL_APP_KEY || '';

async function tflFetch(path, params = {}) {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  if (APP_KEY) url.searchParams.set('app_key', APP_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TfL API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// Live disruption/status feed for one or more transport modes.
// e.g. getLineStatus(['tube', 'bus', 'overground'])
export function getLineStatus(modes = ['tube', 'bus', 'dlr', 'overground']) {
  return tflFetch(`/Line/Mode/${modes.join(',')}/Status`);
}

// Journey planner: route options between two named or coordinate locations.
export function planJourney(from, to) {
  return tflFetch(`/Journey/JourneyResults/${encodeURIComponent(from)}/to/${encodeURIComponent(to)}`);
}

// Nearby stop points (bus stops, stations) around a lat/lon.
export function getNearbyStops(lat, lon, radius = 500) {
  return tflFetch('/StopPoint', {
    lat,
    lon,
    radius,
    stopTypes: 'NaptanPublicBusCoachTram,NaptanMetroStation,NaptanRailStation',
  });
}

// Santander Cycles (bike share) docking stations with live availability.
export function getBikePoints() {
  return tflFetch('/BikePoint');
}

// Extracts { bikes, empty, docks } counts from a raw BikePoint entry.
export function parseBikePointCounts(point) {
  const props = point.additionalProperties || [];
  const find = (key) => props.find((p) => p.key === key)?.value;
  return {
    bikes: Number(find('NbBikes') ?? 0),
    empty: Number(find('NbEmptyDocks') ?? 0),
    docks: Number(find('NbDocks') ?? 0),
  };
}
