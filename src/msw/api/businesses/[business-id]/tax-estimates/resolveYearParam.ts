export const resolveYearParam = (request: Request): number => {
  const yearParam = Number(new URL(request.url).searchParams.get('year'))
  return Number.isInteger(yearParam) && yearParam > 0 ? yearParam : new Date().getFullYear()
}
