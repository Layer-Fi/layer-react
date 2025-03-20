import { IconSvgProps } from './types'

const CloseIcon = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 12 12'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M8.75 3.25L3.25 8.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.25 3.25L8.75 8.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default CloseIcon
