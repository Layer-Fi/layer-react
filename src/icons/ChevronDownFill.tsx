import { IconSvgProps } from './types'

const ChevronDownFill = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path d='M4.5 6.75L9 11.25L13.5 6.75' fill='currentColor' />
    <path
      d='M4.5 6.75L9 11.25L13.5 6.75H4.5Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default ChevronDownFill
