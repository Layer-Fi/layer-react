import { IconSvgProps } from './types'

const SmileIcon = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 12 12'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M6.5 11.5C9.26142 11.5 11.5 9.26142 11.5 6.5C11.5 3.73858 9.26142 1.5 6.5 1.5C3.73858 1.5 1.5 3.73858 1.5 6.5C1.5 9.26142 3.73858 11.5 6.5 11.5Z'
      stroke='#3B9C63'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.5 7.5C4.5 7.5 5.25 8.5 6.5 8.5C7.75 8.5 8.5 7.5 8.5 7.5'
      stroke='#3B9C63'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M5 5H5.005'
      stroke='#3B9C63'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M8 5H8.005'
      stroke='#3B9C63'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default SmileIcon
