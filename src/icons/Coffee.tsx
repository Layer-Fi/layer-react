import { IconSvgProps } from './types'

const CoffeeIcon = ({ size = 11, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 12'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <g clipPath='url(#clip0_5018_10141)'>
      <path
        d='M3.25 4.16666H2.79167C2.30544 4.16666 1.83912 4.35981 1.4953 4.70363C1.15149 5.04744 0.958333 5.51376 0.958333 5.99999C0.958333 6.48622 1.15149 6.95254 1.4953 7.29635C1.83912 7.64017 2.30544 7.83332 2.79167 7.83332H3.25'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.5834 4.16666H3.25004V8.29166C3.25004 8.77789 3.4432 9.2442 3.78701 9.58802C4.13083 9.93184 4.59714 10.125 5.08337 10.125H8.75004C9.23627 10.125 9.70259 9.93184 10.0464 9.58802C10.3902 9.2442 10.5834 8.77789 10.5834 8.29166V4.16666Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.75 0.958344V2.33334'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M6.91663 0.958344V2.33334'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M5.08337 0.958344V2.33334'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
    <defs>
      <clipPath id='clip0_5018_10141'>
        <rect
          width='11'
          height='11'
          fill='white'
          transform='matrix(-1 0 0 1 11.5 0.5)'
        />
      </clipPath>
    </defs>
  </svg>
)

export default CoffeeIcon
