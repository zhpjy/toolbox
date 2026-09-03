const FALLBACK_MODIFY_COLOR = "#7f7fff"
const LIGHT_PURPLE = "#f3efff"
const BASE_PURPLE = "#7f7fff"
const DARK_PURPLE = "#6d5bd0"
const BASE_PURPLE_RATIO = 0.2
const HIGH_CONTRAST_RATIO_END = 2

function parseNumber(value: string): number | null {
  const parsed = Number(value.trim().replace(/,/g, ""))
  return value.trim() !== "" && Number.isFinite(parsed) ? parsed : null
}

function interpolate(start: number, end: number, intensity: number) {
  return Math.round(start + (end - start) * intensity)
}

function interpolateColor(from: string, to: string, intensity: number) {
  const rgb = (hex: string) => [0, 2, 4].map((offset) => parseInt(hex.slice(offset + 1, offset + 3), 16))
  const start = rgb(from)
  const end = rgb(to)
  return `#${[0, 1, 2].map((index) => interpolate(start[index]!, end[index]!, intensity).toString(16).padStart(2, "0")).join("")}`
}

/** 依据“旧值->新值”的相对变化比例生成渐变背景色。 */
export function getModifyCellBackgroundColor(value: string): string {
  const match = value.match(/^\s*(.*?)\s*(?:->|→)\s*(.*?)\s*$/)
  if (!match) return FALLBACK_MODIFY_COLOR
  const left = parseNumber(match[1]!)
  const right = parseNumber(match[2]!)
  if (left === null || right === null || left === 0) return FALLBACK_MODIFY_COLOR

  const ratio = Math.abs(right - left) / Math.abs(left)
  if (ratio <= BASE_PURPLE_RATIO) {
    return interpolateColor(LIGHT_PURPLE, BASE_PURPLE, ratio / BASE_PURPLE_RATIO)
  }
  return interpolateColor(
    BASE_PURPLE,
    DARK_PURPLE,
    Math.min((ratio - BASE_PURPLE_RATIO) / (HIGH_CONTRAST_RATIO_END - BASE_PURPLE_RATIO), 1)
  )
}
