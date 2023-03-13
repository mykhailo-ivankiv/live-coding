export type Range = { start: number; end: number }
export const isRangesIntersect = (a: Range, b: Range): boolean => a.start < b.end && b.start < a.end