import { type ReactNode, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

export enum TextSize {
  lg = 'lg',
  md = 'md',
  sm = 'sm',
}

export enum TextWeight {
  normal = 'normal',
  bold = 'bold',
}

export enum TextUseTooltip {
  whenTruncated = 'whenTruncated',
  always = 'always',
}

export type TextStatus = 'success' | 'error' | 'warning' | 'disabled' | 'info'

export interface TextTooltipOptions {
  contentClassName?: string
  offset?: number
  shift?: { padding?: number }
}

export interface TextProps {
  as?: React.ElementType
  className?: string
  children: ReactNode
  size?: TextSize
  weight?: TextWeight
  status?: TextStatus
  htmlFor?: string
  withDeprecatedTooltip?: TextUseTooltip
  tooltipOptions?: TextTooltipOptions
  ellipsis?: boolean
  pb?: '4xs' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg'
  invertColor?: boolean
}

export const Text = ({
  as: Component = 'p',
  className,
  children,
  size = TextSize.md,
  weight = TextWeight.normal,
  withDeprecatedTooltip: withTooltip,
  ellipsis,
  status,
  pb,
  invertColor,
  ...props
}: TextProps) => {
  const dataProperties = toDataProperties({ status, ellipsis, pb, inverted: invertColor })

  const baseClassName = classNames(
    `Layer__text Layer__text--${size} Layer__text--${weight}`,
    className,
  )

  if (withTooltip) {
    return (
      <DeprecatedTextWithTooltip
        as={Component}
        className={baseClassName}
        size={size}
        weight={weight}
        withDeprecatedTooltip={withTooltip}
        {...dataProperties}
        {...props}
      >
        {children}
      </DeprecatedTextWithTooltip>
    )
  }

  return (
    <Component {...props} {...dataProperties} className={baseClassName}>
      {children}
    </Component>
  )
}

export const DeprecatedTextWithTooltip = ({
  as: Component = 'p',
  className,
  children,
  size: _size = TextSize.md,
  weight: _weight = TextWeight.normal,
  withDeprecatedTooltip: _withTooltip = TextUseTooltip.whenTruncated,
  tooltipOptions,
  ...props
}: TextProps) => {
  const textElementRef = useRef<HTMLElement>()
  const compareSize = () => {
    const firstChild = textElementRef.current?.children[0]
    if (firstChild) {
      const compare =
        firstChild.scrollWidth
        > firstChild.clientWidth
      setHover(compare)
    }
  }

  useEffect(() => {
    compareSize()
    window.addEventListener('resize', compareSize)
  }, [])

  useEffect(
    () => () => {
      window.removeEventListener('resize', compareSize)
    },
    [],
  )

  const [hoverStatus, setHover] = useState(false)

  const contentClassName = classNames(
    'Layer__tooltip',
    tooltipOptions?.contentClassName,
  )

  return (
    <DeprecatedTooltip
      disabled={!hoverStatus}
      offset={tooltipOptions?.offset}
      shift={tooltipOptions?.shift}
    >
      <DeprecatedTooltipTrigger>
        <Component className={className} ref={textElementRef} {...props}>
          {children}
        </Component>
      </DeprecatedTooltipTrigger>
      <DeprecatedTooltipContent className={contentClassName}>{children}</DeprecatedTooltipContent>
    </DeprecatedTooltip>
  )
}
