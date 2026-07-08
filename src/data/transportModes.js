// Static reference data — deliberately kept local so the core
// experience works with zero external dependencies (pass-grade requirement).
export const TRANSPORT_MODES = [
  {
    id: 'bus',
    name: 'Bus',
    lineColour: 'var(--line-bus)',
    description:
      'Frequent, low-cost services covering most streets, including areas rail cannot reach directly.',
    benefits: ['Extensive coverage', 'No booking needed', 'Step-free on most routes'],
    limitations: ['Slower in traffic', 'Timetable can be affected by congestion'],
    avgSpeedKmh: 18,
  },
  {
    id: 'rail',
    name: 'Rail',
    lineColour: 'var(--line-rail)',
    description:
      'Underground, Overground and national rail services for fast movement across longer distances.',
    benefits: ['High speed over distance', 'Frequent off-peak', 'Predictable journey times'],
    limitations: ['Higher cost per km', 'Station access may involve walking or transfers'],
    avgSpeedKmh: 45,
  },
  {
    id: 'cycle',
    name: 'Cycling',
    lineColour: 'var(--line-cycle)',
    description:
      'Self-powered travel using a personal or hired bike — flexible and low impact.',
    benefits: ['Low cost', 'Health benefit', 'No timetable dependency'],
    limitations: ['Weather-dependent', 'Requires suitable cycle routes'],
    avgSpeedKmh: 15,
  },
  {
    id: 'walk',
    name: 'Walking',
    lineColour: 'var(--line-walk)',
    description:
      'The simplest option for short local trips — zero cost and zero emissions.',
    benefits: ['Free', 'Zero emissions', 'No planning required'],
    limitations: ['Only practical for shorter distances', 'Slower for longer trips'],
    avgSpeedKmh: 5,
  },
];

export function getMode(id) {
  return TRANSPORT_MODES.find((m) => m.id === id);
}
