import { endOfMonth, getDate, getDay, getDaysInMonth, getMonth, getYear, startOfMonth } from 'date-fns'
import { concat, curry, head, inc, last, map, pipe, range } from 'ramda'

const DAYS_IN_SIX_WEEKS = 6 * 7
const DAYS_IN_WEEK = 7
export const extendMontToSixWeeks = (month: Date[]) => {
  if (month.length === DAYS_IN_SIX_WEEKS) return month

  let result = month
  const startDay = getDate(head(result))
  const startYear = getYear(head(result))
  const startMonth = getMonth(head(result))
  // Insert additional days in the beginning of the result
  if (startDay === 1) {
    result = concat(
      range(-6, 1).map((day) => new Date(startYear, startMonth, day)),
      result,
    )
  }

  if (result.length === DAYS_IN_SIX_WEEKS) return result

  // Insert additional days in the end of the result
  const endDay = getDate(last(result))
  const endYear = getYear(last(result))
  const endMonth = getMonth(last(result))

  const additionalDays = range(endDay + 1, endDay + DAYS_IN_SIX_WEEKS - result.length + 1).map(
    (day) => new Date(endYear, endMonth, day),
  )
  return concat(result, additionalDays)
}

export const getAllDaysInMonth = curry((date: Date, clamp: boolean, weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
  const year = getYear(date)
  const month = getMonth(date)

  const weekDiff = weekStart - getDay(startOfMonth(date)) + 1
  const weekShift = weekDiff > 1 ? weekDiff - DAYS_IN_WEEK : weekDiff
  const startRange = clamp ? weekShift : 1

  return pipe(
    getDaysInMonth,
    clamp
      ? (n: number) => {
          const dayOfEndOfMonth = getDay(endOfMonth(date))
          const suffix = (6 + weekStart - dayOfEndOfMonth) % 7

          return n + suffix + 1
        }
      : inc,
    range(startRange),
    map((day: number) => new Date(year, month, day)),
  )(date)
})

export const getMonths = (date: Date): Date[] => {
  const year = getYear(date)

  return range(0, 12).map((n) => new Date(year, n))
}
