const DEFAULT_INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[data-row-click-ignore="true"]',
].join(',')

export const isInteractiveEventTarget = (
  target: EventTarget | null,
  selector: string = DEFAULT_INTERACTIVE_SELECTOR,
): boolean => {
  if (!(target instanceof Element)) return false

  return target.closest(selector) !== null
}
