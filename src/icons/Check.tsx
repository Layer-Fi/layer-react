import { type IconSvgProps } from '@icons/types'

const Check = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M15 4.5L6.75 12.75L3 9'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Check
