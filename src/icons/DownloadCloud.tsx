import { type IconSvgProps } from '@icons/types'

const DownloadCloud = ({ size = 18, ...props }: IconSvgProps) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 18 18'
    fill='none'
    {...props}
    width={size}
    height={size}
  >
    <path
      d='M6 12.75L9 15.75L12 12.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M9 9V15.75'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.66 13.5675C16.3121 13.109 16.801 12.4546 17.056 11.6994C17.3109 10.9441 17.3186 10.1273 17.0778 9.36737C16.837 8.60748 16.3604 7.94407 15.7171 7.47342C15.0737 7.00278 14.2971 6.74938 13.5 6.75H12.555C12.3294 5.87091 11.9074 5.05444 11.3206 4.36206C10.7338 3.66969 9.99762 3.11945 9.16742 2.75277C8.33721 2.38609 7.43464 2.21252 6.52766 2.24514C5.62067 2.27776 4.7329 2.51571 3.93118 2.94107C3.12946 3.36644 2.43468 3.96814 1.89915 4.70087C1.36362 5.43361 1.0013 6.27829 0.839456 7.17132C0.677613 8.06434 0.720468 8.98245 0.964796 9.85652C1.20912 10.7306 1.64856 11.5378 2.25001 12.2175'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
)
export default DownloadCloud
