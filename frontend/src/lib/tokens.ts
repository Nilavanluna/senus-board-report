// Bridges the CSS custom properties defined in index.css's @theme block into
// contexts where a Tailwind class won't apply the font (recharts renders raw
// SVG text elements via inline style/attrs, not className).
export const numericFontFamily = 'var(--font-numeric)'
