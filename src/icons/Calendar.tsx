import * as React from 'react'
import { SVGProps } from 'react'

const Calendar = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={20}
    height={22}
    fill='none'
    {...props}
  >
    <path
      stroke='#000'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M19 9H1m13-8v4M6 1v4m-.2 16h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C19 18.72 19 17.88 19 16.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C16.72 3 15.88 3 14.2 3H5.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C1 5.28 1 6.12 1 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C3.28 21 4.12 21 5.8 21Z'
    />
  </svg>
)
export default Calendar
