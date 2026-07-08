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
  // TfL returns 300 Multiple Choices (with a JSON disambiguation body,
  // not an error) when a free-text place name is ambiguous — that's a
  // valid response we need to read, not a failure.
  if (!res.ok && res.status !== 300) {
    throw new Error(`TfL API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// Picks the best-matching candidate from a TfL disambiguation block.
// Returns the original text unchanged if TfL already resolved it uniquely.
function resolveLocation(original, disambiguation) {
  const options = disambiguation?.disambiguationOptions;
  if (!options || options.length === 0) return original;
  const best = [...options].sort((a, b) => (b.matchQuality || 0) - (a.matchQuality || 0))[0];
  return best?.parameterValue || null;
}

// Live disruption/status feed for one or more transport modes.
// e.g. getLineStatus(['tube', 'bus', 'overground'])
export function getLineStatus(modes = ['tube', 'bus', 'dlr', 'overground']) {
  return tflFetch(`/Line/Mode/${modes.join(',')}/Status`);
}

// Journey planner: route options between two named or coordinate locations.
// Transparently resolves TfL's "300 Multiple Choices" disambiguation by
// picking the best-quality match on each side, then re-querying.
export async function planJourney(from, to) {
  let result = await tflFetch(`/Journey/JourneyResults/${encodeURIComponent(from)}/to/${encodeURIComponent(to)}`);

  const isDisambiguation = result?.$type?.includes('DisambiguationResult');
  if (isDisambiguation) {
    const resolvedFrom = resolveLocation(from, result.fromLocationDisambiguation);
    const resolvedTo = resolveLocation(to, result.toLocationDisambiguation);

    if (!resolvedFrom || !resolvedTo) {
      throw new Error(
        'Could not identify one of those locations. Try a more specific name — e.g. add "station" or a postcode.'
      );
    }

    result = await tflFetch(`/Journey/JourneyResults/${encodeURIComponent(resolvedFrom)}/to/${encodeURIComponent(resolvedTo)}`);
  }

  return result;
}

// Nearby stop points (bus stops, stations) around a lat/lon.
export async function getNearbyStops(lat, lon, radius = 500) {
  const result = await tflFetch('/StopPoint', {
    lat,
    lon,
    radius,
    stopTypes: 'NaptanPublicBusCoachTram,NaptanMetroStation,NaptanRailStation',
  });
  return result?.stopPoints ?? [];
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