export const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  timeout = 300,
) => {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    clearTimeout(timer)

    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), timeout)
    })
  }
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
