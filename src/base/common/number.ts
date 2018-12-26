export function clamp(val: number, max: number, min: number): number {
  return val >= max ? max : val <= min ? min : val;
}
