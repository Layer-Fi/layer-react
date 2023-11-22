import * as React from 'react'
import { SVGProps } from 'react'

type Props = {
  strokeColor?: string
  size?: number
}

const ChavronRight = ({
  strokeColor,
  size,
  ...props
}: Props & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke={strokeColor ?? '#000'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m9 18 6-6-6-6"
    />
  </svg>
)
export default ChavronRight
