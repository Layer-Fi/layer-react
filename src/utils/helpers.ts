export const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const sleep = (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

/**
 * Convert the account name into stable_name
 */
export const convertToStableName = (name: string): string =>
  name
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '')
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_')
