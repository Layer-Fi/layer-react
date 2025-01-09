import * as React from 'react'
import { IconSvgProps } from './types'

const Quickbooks = ({ size = 20, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 20 20'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path d='M9.99995 20.0001C15.5216 20.0001 20 15.5217 20 10C20 4.47838 15.5216 -2.28882e-05 9.99995 -2.28882e-05C4.47832 -2.28882e-05 -9.15527e-05 4.47838 -9.15527e-05 10C-9.15527e-05 15.5217 4.47507 20.0001 9.99995 20.0001Z' fill='#2CA01C' />
    <path d='M6.66547 6.10973C4.51726 6.10973 2.7753 7.85169 2.7753 9.9999C2.7753 12.1481 4.51401 13.8868 6.66547 13.8868H7.22121V12.4438H6.66547C5.31675 12.4438 4.22152 11.3486 4.22152 9.9999C4.22152 8.65118 5.31675 7.55595 6.66547 7.55595H8.00119V15.112C8.00119 15.9083 8.64793 16.555 9.44416 16.555V6.10973H6.66547ZM13.3343 13.8868C15.4825 13.8868 17.2245 12.1449 17.2245 9.9999C17.2245 7.85494 15.4858 6.11298 13.3343 6.11298H12.7786V7.55595H13.3343C14.6831 7.55595 15.7783 8.65118 15.7783 9.9999C15.7783 11.3486 14.6831 12.4438 13.3343 12.4438H11.9986V4.88776C11.9986 4.09152 11.3519 3.44479 10.5556 3.44479V13.8868H13.3343Z' fill='white' />
  </svg>
)

export default Quickbooks
