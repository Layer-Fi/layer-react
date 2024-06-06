import * as React from 'react'
import { IconSvgProps } from './types'

const Inbox = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M16.5 9H12L10.5 11.25H7.5L6 9H1.5'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M4.0875 3.8325L1.5 9V13.5C1.5 13.8978 1.65804 14.2794 1.93934 14.5607C2.22064 14.842 2.60218 15 3 15H15C15.3978 15 15.7794 14.842 16.0607 14.5607C16.342 14.2794 16.5 13.8978 16.5 13.5V9L13.9125 3.8325C13.7883 3.58259 13.5969 3.37228 13.3597 3.22521C13.1226 3.07814 12.8491 3.00015 12.57 3H5.43C5.15094 3.00015 4.87745 3.07814 4.64028 3.22521C4.40312 3.37228 4.21168 3.58259 4.0875 3.8325Z'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)

export default Inbox
