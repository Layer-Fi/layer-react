import { IconSvgProps } from './types'

const Eye = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 18 18'
    fill='none'
    {...props}
  >
    <g>
      <path
        d='M0.75 9C0.75 9 3.75 3 9 3C14.25 3 17.25 9 17.25 9C17.25 9 14.25 15 9 15C3.75 15 0.75 9 0.75 9Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
  </svg>
)

export default Eye
