import { isRangesIntersect, Range } from './range'

export type Rect = { x: number; y: number; width: number; height: number }
export const findYPosition = (x: number, approximateY: number, width: number, height: number, rects: Rect[]) => {
  const margin = 20
  let yRange = { start: approximateY - margin, end: approximateY + height + margin }
  let xRange = { start: x - margin, end: x + width + margin }

  const rectsInTheSameColumn = rects.filter(({ x, width }) => isRangesIntersect({ start: x, end: x + width }, xRange))
  const intersectWith = rectsInTheSameColumn.find((rect) =>
    isRangesIntersect(yRange, { start: rect.y, end: rect.y + rect.height }),
  )

  if (!intersectWith) return approximateY

  let intersectOnTop: Rect | undefined = intersectWith
  let freeYPositionOnTop: Range = { ...yRange }

  while (intersectOnTop) {
    freeYPositionOnTop.start = intersectOnTop.y - height - margin
    freeYPositionOnTop.end = intersectOnTop.y - margin
    intersectOnTop = rectsInTheSameColumn.find((rect) =>
      isRangesIntersect(freeYPositionOnTop, { start: rect.y, end: rect.y + rect.height }),
    )
  }

  let intersectOnBottom: Rect | undefined = intersectWith
  let freeYPositionOnBottom: Range = { ...yRange }

  while (intersectOnBottom) {
    freeYPositionOnBottom.start = intersectOnBottom.y + intersectOnBottom.height + margin
    freeYPositionOnBottom.end = intersectOnBottom.y + intersectOnBottom.height + height + margin
    intersectOnBottom = rectsInTheSameColumn.find((rect) =>
      isRangesIntersect(freeYPositionOnBottom, { start: rect.y, end: rect.y + rect.height }),
    )
  }

  return Math.abs(approximateY - freeYPositionOnTop.start) < Math.abs(approximateY - freeYPositionOnBottom.start)
    ? freeYPositionOnTop.start
    : freeYPositionOnBottom.start
}
