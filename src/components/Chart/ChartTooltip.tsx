import { type ReactNode } from 'react'
import {
  DefaultZIndexes,
  Rectangle,
  Tooltip,
  type TooltipProps as RechartsTooltipProps,
  ZIndexLayer,
} from 'recharts'

import { Span } from '@ui/Typography/Text'

import './ChartTooltip.scss'

const CURSOR_Y_OFFSET = 28

interface ChartTooltipRowProps {
  label: string
  value?: ReactNode
}

export const ChartTooltipRow = ({ label, value }: ChartTooltipRowProps) => (
  <li>
    <Span size='sm' variant='subtle'>{label}</Span>
    {value}
  </li>
)

interface ChartTooltipContentProps {
  children: ReactNode
}

export const ChartTooltipContent = ({ children }: ChartTooltipContentProps) => (
  <div className='Layer__ChartTooltip'>
    <ul className='Layer__ChartTooltip__list'>
      {children}
    </ul>
  </div>
)

interface ChartTooltipCursorProps {
  width: number
  points?: Array<{ x: number, y: number }>
  height?: number
}

export const ChartTooltipCursor = ({ width, points, height }: ChartTooltipCursorProps) => {
  const firstPoint = points?.[0]
  if (!firstPoint || height === undefined) return null

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.cursorRectangle}>
      <Rectangle
        fill='#F7F8FA'
        stroke='none'
        x={firstPoint.x - width / 2}
        y={firstPoint.y}
        width={width}
        height={height + CURSOR_Y_OFFSET}
        radius={6}
        className='Layer__ChartTooltip__cursor'
      />
    </ZIndexLayer>
  )
}

type ChartTooltipProps = Omit<RechartsTooltipProps<number, string>, 'content' | 'cursor'> & {
  content: JSX.Element
  cursorWidth: number
}

export const ChartTooltip = ({
  content,
  cursorWidth,
  animationDuration = 100,
  animationEasing = 'ease-out',
  ...props
}: ChartTooltipProps) => (
  <Tooltip
    wrapperClassName='Layer__ChartTooltip__wrapper'
    content={content}
    cursor={<ChartTooltipCursor width={cursorWidth} />}
    animationDuration={animationDuration}
    animationEasing={animationEasing}
    {...props}
  />
)
