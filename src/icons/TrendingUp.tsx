import { IconSvgProps } from '@icons/types'

const TrendingUp = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M19.1667 5L11.25 12.9167L7.08337 8.75L0.833374 15'
      stroke='white'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M19.1667 5L11.25 12.9167L7.08337 8.75L0.833374 15'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M14.1666 5H19.1666V10'
      stroke='white'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M14.1666 5H19.1666V10'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default TrendingUp
