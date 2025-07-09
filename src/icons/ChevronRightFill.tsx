import { IconSvgProps } from './types'

const ChevronRightFill = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path d='M6.75 4.5L11.25 9L6.75 13.5' fill='currentColor' />
    <path
      d='M6.75 4.5L11.25 9L6.75 13.5Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default ChevronRightFill
