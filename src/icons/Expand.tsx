import { type IconSvgProps } from '@icons/types'

const Expand = ({ ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='22'
    viewBox='0 0 14 22'
    fill='none'
    {...props}
  >
    <path
      d='M10.5 8.75L7 5.25L3.5 8.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M3.5 13.25L7 16.75L10.5 13.25'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Expand
