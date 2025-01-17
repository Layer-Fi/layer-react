import { IconSvgProps } from './types'

const MoreVertical = ({ size = 18, ...props }: IconSvgProps) => {
  return (
    <svg
      viewBox='0 0 16 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
      width={size}
      height={size}
    >
      <path
        d='M8.66659 8C8.66659 7.63181 8.36811 7.33333 7.99992 7.33333C7.63173 7.33333 7.33325 7.63181 7.33325 8C7.33325 8.36819 7.63173 8.66667 7.99992 8.66667C8.36811 8.66667 8.66659 8.36819 8.66659 8Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.66659 3.33333C8.66659 2.96514 8.36811 2.66667 7.99992 2.66667C7.63173 2.66667 7.33325 2.96514 7.33325 3.33333C7.33325 3.70152 7.63173 4 7.99992 4C8.36811 4 8.66659 3.70152 8.66659 3.33333Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.66659 12.6667C8.66659 12.2985 8.36811 12 7.99992 12C7.63173 12 7.33325 12.2985 7.33325 12.6667C7.33325 13.0349 7.63173 13.3333 7.99992 13.3333C8.36811 13.3333 8.66659 13.0349 8.66659 12.6667Z'
        fill='currentColor'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

export default MoreVertical
