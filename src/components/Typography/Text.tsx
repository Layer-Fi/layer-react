import React, { ReactNode, useRef, useState, useEffect } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import classNames from 'classnames'

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
  htmlFor?: string
  withTooltip?: TextUseTooltip
  tooltipOptions?: TextTooltipOptions
}

export const Text = ({
  as: Component = 'p',
  className,
  children,
  size = TextSize.md,
  weight = TextWeight.normal,
  withTooltip,
  ...props
}: TextProps) => {
  const baseClassName = classNames(
    `Layer__text Layer__text--${size} Layer__text--${weight}`,
    className,
  )

  if (withTooltip) {
    return (
      <TextWithTooltip
        as={Component}
        className={baseClassName}
        size={size}
        weight={weight}
        withTooltip={withTooltip}
        {...props}
      >
        {children}
      </TextWithTooltip>
    )
  }

  return (
    <Component {...props} className={baseClassName}>
      {children}
    </Component>
  )
}

export const TextWithTooltip = ({
  as: Component = 'p',
  className,
  children,
  size = TextSize.md,
  weight = TextWeight.normal,
  withTooltip = TextUseTooltip.whenTruncated,
  tooltipOptions,
  ...props
}: TextProps) => {
  const textElementRef = useRef<HTMLElement>()
  const compareSize = () => {
    if (textElementRef.current) {
      const compare =
        textElementRef.current.children[0].scrollWidth >
        textElementRef.current.children[0].clientWidth
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
    <Tooltip
      disabled={!hoverStatus}
      offset={tooltipOptions?.offset}
      shift={tooltipOptions?.shift}
    >
      <TooltipTrigger>
        <Component className={className} ref={textElementRef} {...props}>
          {children}
        </Component>
      </TooltipTrigger>
      <TooltipContent className={contentClassName}>{children}</TooltipContent>
    </Tooltip>
  )
}
