import { type IconSvgProps } from '@icons/types'

const ArrowRightCircleAlt = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z'
      stroke='var(--color-base-400)'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 12L12 9L9 6'
      stroke='var(--color-base-500)'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M6 9H12'
      stroke='var(--color-base-500)'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)
export default ArrowRightCircleAlt
