import { IconSvgProps } from './types'

const ChevronLeft = ({ ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='18'
    height='18'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
  >
    <path
      d='M11.25 13.5L6.75 9L11.25 4.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)
export default ChevronLeft
