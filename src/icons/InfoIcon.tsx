import { type IconSvgProps } from '@icons/types'

const InfoIcon = ({ size = 16, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 16 16'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <g clipPath='url(#clip0_5615_32375)'>
      <path
        d='M7.99992 14.6667C11.6818 14.6667 14.6666 11.6819 14.6666 8C14.6666 4.3181 11.6818 1.33333 7.99992 1.33333C4.31802 1.33333 1.33325 4.3181 1.33325 8C1.33325 11.6819 4.31802 14.6667 7.99992 14.6667Z'
        stroke='#888888'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8 10.6667V8'
        stroke='#888888'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8 5.33333H8.00667'
        stroke='#888888'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
    <defs>
      <clipPath id='clip0_5615_32375'>
        <rect width='16' height='16' fill='white' />
      </clipPath>
    </defs>
  </svg>
)

export default InfoIcon
