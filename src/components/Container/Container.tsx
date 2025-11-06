import { CSSProperties, ReactNode, forwardRef } from 'react'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { parseStylesFromThemeConfig } from '@utils/colors'
import classNames from 'classnames'

export interface ContainerProps {
  name: string
  className?: string
  asWidget?: boolean
  elevated?: boolean
  transparentBg?: boolean
  children: ReactNode
  style?: CSSProperties
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      name,
      className,
      children,
      asWidget,
      elevated = false,
      transparentBg = false,
      style,
    },
    ref,
  ) => {
    const baseClassName = classNames(
      'Layer__component Layer__component-container',
      `Layer__${name}`,
      elevated && 'Layer__component--elevated',
      transparentBg && 'Layer__component--no-bg',
      asWidget && 'Layer__component--as-widget',
      className,
    )

    const { theme } = useLayerContext()

    const themeStyles = parseStylesFromThemeConfig(theme)

    return (
      <div
        ref={ref}
        className={baseClassName}
        style={{ ...themeStyles, ...style }}
      >
        {children}
      </div>
    )
  },
)

Container.displayName = 'Container'

export { Container }
