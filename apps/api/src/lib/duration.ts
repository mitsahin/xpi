/** Parse jwt expiresIn-like strings (15m, 7d, 30d, or bare seconds). */
export function parseDurationToMs(value: string, fallbackMs = 15 * 60 * 1000): number {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;
  const m = trimmed.match(/^(\d+)([smhd])$/i);
  if (!m) return fallbackMs;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult =
    unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return n * mult;
}
