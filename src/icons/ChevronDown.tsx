import * as React from 'react'
import { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & {
  size: SVGProps<SVGSVGElement>['width']
}
const ChevronDown = ({ size = 24, ...props }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m6 9 6 6 6-6"
    />
  </svg>
)
export default ChevronDown
