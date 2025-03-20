import { IconSvgProps } from './types'

const CreditCard = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 12'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M10.5 2H1.5C0.947715 2 0.5 2.44772 0.5 3V9C0.5 9.55228 0.947715 10 1.5 10H10.5C11.0523 10 11.5 9.55228 11.5 9V3C11.5 2.44772 11.0523 2 10.5 2Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M0.5 5H11.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default CreditCard
