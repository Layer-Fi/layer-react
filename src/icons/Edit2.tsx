import { IconSvgProps } from './types'

const Edit2 = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M12.75 2.25C12.947 2.05301 13.1808 1.89676 13.4382 1.79015C13.6956 1.68355 13.9714 1.62868 14.25 1.62868C14.5286 1.62868 14.8044 1.68355 15.0618 1.79015C15.3192 1.89676 15.553 2.05301 15.75 2.25C15.947 2.44698 16.1032 2.68083 16.2098 2.9382C16.3165 3.19557 16.3713 3.47142 16.3713 3.75C16.3713 4.02857 16.3165 4.30442 16.2098 4.56179C16.1032 4.81916 15.947 5.05302 15.75 5.25L5.625 15.375L1.5 16.5L2.625 12.375L12.75 2.25Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)
export default Edit2
