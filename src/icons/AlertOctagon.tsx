import { IconSvgProps } from '@icons/types'

const AlertOctagon = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    viewBox='0 0 18 18'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M5.895 1.5H12.105L16.5 5.895V12.105L12.105 16.5H5.895L1.5 12.105V5.895L5.895 1.5Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 6V9'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 12H9.0075'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default AlertOctagon
