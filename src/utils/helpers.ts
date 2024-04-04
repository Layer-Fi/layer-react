export const range = (start: number, end: number) => {
  let length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fnc: F,
  timeout = 300,
) => {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fnc.apply(this, args)
    }, timeout)
  }
}

export const sleep = (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

export const convertToStableName = (name: string) =>
  name
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_')
