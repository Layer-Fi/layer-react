import { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & {
  size: SVGProps<SVGSVGElement>['width']
  fillColor: string
  strokeColor: string
}

const CheckedCircle = ({
  fillColor = 'none',
  strokeColor = '#000',
  size = 24,
  ...props
}: Props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill={fillColor}
    {...props}
  >
    <path
      stroke={strokeColor}
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='m7.5 12 3 3 6-6m5.5 3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z'
    />
  </svg>
)
export default CheckedCircle
