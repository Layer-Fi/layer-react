export const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const sleep = (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time))
}
