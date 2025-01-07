import type { ReactNode } from 'react'

type GenericFn<TOut> = (...args: Array<never>) => TOut
type RenderProp<T extends GenericFn<ReactNode>> = ReactNode | T

export function withRenderProp<T extends GenericFn<ReactNode>>(
  renderProp: RenderProp<T>,
  callback: (node: ReactNode) => ReactNode,
) {
  if (typeof renderProp === 'function') {
    return renderProp
  }

  return callback(renderProp)
}
