import { IconSvgProps } from '@icons/types'

const ChevronRight = ({ ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='18'
    height='18'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
  >
    <path
      d='M6.75 13.5L11.25 9L6.75 4.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)
export default ChevronRight
