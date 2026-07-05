// Chart mark colors, validated against the zinc-950 (#09090b) dark chart
// surface with the dataviz skill's six-checks validator (lightness band,
// chroma floor, CVD adjacent-pair separation, contrast) before use here.
// Tailwind's *-500 step reads too light/glary on a near-black surface for
// touching chart marks, so these are the *-600 steps (rose stays 500).
export const chartColor = {
  primary: '#2563eb', // blue-600 - revenue, margin trend, "delivered" segment
  positive: '#059669', // emerald-600 - favorable deltas (EBITDA, WC inflow)
  warning: '#d97706', // amber-600 - the Senus 2030 "required" gap segment
  negative: '#f43f5e', // rose-500 - unfavorable deltas (interest, capex)
} as const

export const chartChrome = {
  grid: '#27272a', // zinc-800, hairline
  axis: '#3f3f46', // zinc-700
  mutedText: '#71717a', // zinc-500
  secondaryText: '#a1a1aa', // zinc-400
  primaryText: '#f4f4f5', // zinc-100
} as const
