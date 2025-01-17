import { IconSvgProps } from './types'

const WarningCircle = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 12 12'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <g clipPath='url(#clip0_2217_119740)'>
      <path
        d='M6.00008 10.5833C8.53139 10.5833 10.5834 8.5313 10.5834 6C10.5834 3.46869 8.53139 1.41666 6.00008 1.41666C3.46878 1.41666 1.41675 3.46869 1.41675 6C1.41675 8.5313 3.46878 10.5833 6.00008 10.5833Z'
        stroke='currentColor'
        strokeOpacity='0.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6 4.16666V6'
        stroke='currentColor'
        strokeOpacity='0.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6 7.83333H6.00458'
        stroke='currentColor'
        strokeOpacity='0.6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
    <defs>
      <clipPath id='clip0_2217_119740'>
        <rect
          width='11'
          height='11'
          fill='white'
          transform='translate(0.5 0.5)'
        />
      </clipPath>
    </defs>
  </svg>
)

export default WarningCircle
