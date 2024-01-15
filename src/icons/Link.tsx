import * as React from 'react'
import { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & {
  size: SVGProps<SVGSVGElement>['width']
}

const Link = ({ size = 24, ...props }: Props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    fill='none'
    viewBox='0 0 24 24'
    {...props}
  >
    <path
      stroke='#000'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='m12.708 18.364-1.415 1.414a5 5 0 1 1-7.07-7.07l1.413-1.415m12.728 1.414 1.415-1.414a5 5 0 0 0-7.071-7.071l-1.415 1.414M8.5 15.5l7-7'
    />
  </svg>
)
export default Link
