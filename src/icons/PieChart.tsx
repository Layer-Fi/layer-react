import * as React from 'react'
import { IconSvgProps } from './types'

const PieChart = ({ size = 12, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 12 12'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <g>
      <path
        d='M10.2213 7.78271C9.92969 8.47226 9.47363 9.07989 8.89297 9.55247C8.3123 10.0251 7.62471 10.3482 6.89031 10.4936C6.1559 10.6391 5.39705 10.6024 4.68009 10.3869C3.96313 10.1713 3.30989 9.78337 2.77749 9.25701C2.24509 8.73065 1.84973 8.08189 1.62598 7.36744C1.40223 6.65298 1.3569 5.8946 1.49396 5.15858C1.63102 4.42257 1.94629 3.73133 2.41221 3.14531C2.87813 2.55928 3.48051 2.09631 4.16669 1.79688'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M10.5833 6.00033C10.5833 5.39843 10.4648 4.80244 10.2344 4.24636C10.0041 3.69028 9.66651 3.18502 9.24091 2.75942C8.8153 2.33382 8.31004 1.99621 7.75397 1.76588C7.19789 1.53554 6.60189 1.41699 6 1.41699V6.00033H10.5833Z'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </g>
  </svg>
)

export default PieChart
