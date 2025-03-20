import { SVGProps } from 'react'

const ChevronUp = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={24}
    height={24}
    fill='none'
    viewBox='0 0 24 24'
    {...props}
  >
    <path
      stroke='#000'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='m18 15-6-6-6 6'
    />
  </svg>
)

export default ChevronUp
