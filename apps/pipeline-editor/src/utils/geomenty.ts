import { isRangesIntersect, Range } from './range'
import { applyToPoint, Matrix } from 'transformation-matrix'

export type Rect = { x: number; y: number; width: number; height: number }

export const isRectsIntersect = (rectA: Rect, rectB: Rect) => {
  const xRange1 = { start: rectA.x, end: rectA.x + rectA.width }
  const xRange2 = { start: rectB.x, end: rectB.x + rectB.width }
  const yRange1 = { start: rectA.y, end: rectA.y + rectA.height }
  const yRange2 = { start: rectB.y, end: rectB.y + rectB.height }
  return isRangesIntersect(xRange1, xRange2) && isRangesIntersect(yRange1, yRange2)
}

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

/**
 * If `rect` width or height of rect is less than `0` this function recalculate x and y position.
 */
export const normalizeRect = ({ x, y, width, height }: Rect): Rect => ({
  x: width >= 0 ? x : x + width,
  y: height >= 0 ? y : y + height,
  height: Math.abs(height),
  width: Math.abs(width),
})

export const transformRect = (matrix: Matrix, rect: Rect): Rect => ({
  ...applyToPoint(matrix, rect),
  width: rect.width * matrix.a,
  height: rect.height * matrix.a,
})
