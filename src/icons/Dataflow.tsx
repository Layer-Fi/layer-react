import * as React from 'react'
import { SVGProps } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={24}
    height={24}
    fill='none'
    {...props}
  >
    <path
      stroke='#000'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 4v11.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C14.28 20 15.12 20 16.8 20h.2m0 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM7 4h10M7 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-5 8h5m0 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z'
    />
  </svg>
)
export default SvgComponent
