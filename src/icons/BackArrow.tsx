import { IconSvgProps } from '@icons/types'

const BackArrow = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 12 12'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M7.375 8.75L4.625 6L7.375 3.25'
      stroke='#1A130D'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default BackArrow
