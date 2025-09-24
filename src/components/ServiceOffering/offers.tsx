/* eslint-disable unused-imports/no-unused-vars */
import { ServiceOfferingConfig, ServiceOfferingValueProposition } from './types'
import {
  imageBusinessAccounts,
  imageBusinessOverview,
  imageCategorizeExpenses,
  imageBookkeeperInquiries,
  imageScheduleBookkeeperMeeting,
  imagePnlOverview,
} from '../../assets/images'

const accountingValueProps: ServiceOfferingValueProposition[] = [
  {
    icon: <img src={imageBusinessAccounts} alt='Business bank accounts and credit cards connection icon' />,
    title: 'Connect your business accounts',
    text: 'Connect your business bank accounts and credit cards right within {platformName}.',
  },
  {
    icon: <img src={imageCategorizeExpenses} alt='Expense categorization and organization icon' />,
    title: 'Categorize expenses',
    text: 'Organize transactions into categories built for {industry}.',
  },
  {
    icon: <img src={imageBusinessOverview} alt='Business overview dashboard with charts and financial metrics' />,
    title: 'Get a clear picture of your business',
    text: 'See your business profitability and stay organized for tax time.',
  },
]

const bookkeepingValueProps: ServiceOfferingValueProposition[] = [
  {
    icon: <img src={imageScheduleBookkeeperMeeting} alt='Calendar scheduling icon for bookkeeper consultation' />,
    title: 'Schedule a call with your Bookkeeper',
    text: 'Get personalized guidance from your dedicated bookkeeper to review your finances and answer questions.',
  },
  {
    icon: <img src={imageBookkeeperInquiries} alt='Notification bell icon for bookkeeping task updates and clarifications' />,
    title: 'Get notified on bookkeeping clarifications',
    text: 'Receive clear notifications when your bookkeeper needs additional information or clarification on transactions.',
  },
  {
    icon: <img src={imagePnlOverview} alt='Profit and loss statement chart for tax preparation and business analysis' />,
    title: 'Get ready for tax season',
    text: 'Your books will be organized and tax-ready with accurate categorization and financial statements prepared by professionals.',
  },
]

export const ServiceOfferingAccounting: ServiceOfferingConfig = {
  badge: 'Easy to use software',
  cta: {
    label: 'Get Started',
    url: '/',
  },
  title: 'Dripos Accounting',
  description: 'The best accounting software for Coffee Shop businesses. Fast to set up and easy to use.',
  features: [
    { icon: (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
        <path d='M12.5 13.1597V11.9097C12.5 11.2466 12.2366 10.6107 11.7678 10.1419C11.2989 9.67306 10.663 9.40967 10 9.40967H5C4.33696 9.40967 3.70107 9.67306 3.23223 10.1419C2.76339 10.6107 2.5 11.2466 2.5 11.9097V13.1597M10 4.40967C10 5.79038 8.88071 6.90967 7.5 6.90967C6.11929 6.90967 5 5.79038 5 4.40967C5 3.02896 6.11929 1.90967 7.5 1.90967C8.88071 1.90967 10 3.02896 10 4.40967Z' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ), description: 'Direct integration with Dripos' },
    { icon: (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
        <path d='M7.5 4.479C7.5 3.81596 7.23661 3.18008 6.76777 2.71124C6.29893 2.2424 5.66304 1.979 5 1.979H1.25V11.354H5.625C6.12228 11.354 6.59919 11.5515 6.95083 11.9032C7.30246 12.2548 7.5 12.7317 7.5 13.229M7.5 4.479V13.229M7.5 4.479C7.5 3.81596 7.76339 3.18008 8.23223 2.71124C8.70107 2.2424 9.33696 1.979 10 1.979H13.75V11.354H9.375C8.87772 11.354 8.40081 11.5515 8.04917 11.9032C7.69754 12.2548 7.5 12.7317 7.5 13.229' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ), description: 'Track expenses and receipts' },
    { icon: (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
        <path d='M14.375 3.92334L8.4375 9.86084L5.3125 6.73584L0.625 11.4233M14.375 3.92334H10.625M14.375 3.92334V7.67334' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    ), description: 'Easy to understand profitability charts and reports' },
  ],
  unit: '/month',
  pricing: '$299',
  valueProposition: accountingValueProps,
}

export const ServiceOfferingBookkeeping: ServiceOfferingConfig = {
  badge: 'A complete bookkeeping service',
  cta: {
    label: 'Get Started',
    url: '/',
  },
  title: 'Full-service Bookkeeping',
  description: 'Get a dedicated bookkeeper who will organize and manage your books for you.',
  features: [
    { icon: (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
        <g clipPath='url(#clip0_9916_27706)'>
          <path d='M9.29199 11.3267V10.3267C9.29199 9.79623 9.08128 9.28752 8.70621 8.91245C8.33113 8.53737 7.82243 8.32666 7.29199 8.32666H3.29199C2.76156 8.32666 2.25285 8.53737 1.87778 8.91245C1.50271 9.28752 1.29199 9.79623 1.29199 10.3267V11.3267' stroke='#333333' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M5.29199 6.32666C6.39656 6.32666 7.29199 5.43123 7.29199 4.32666C7.29199 3.22209 6.39656 2.32666 5.29199 2.32666C4.18742 2.32666 3.29199 3.22209 3.29199 4.32666C3.29199 5.43123 4.18742 6.32666 5.29199 6.32666Z' stroke='#333333' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M12.292 11.3266V10.3266C12.2917 9.88347 12.1442 9.45299 11.8727 9.10276C11.6012 8.75253 11.2211 8.50239 10.792 8.3916' stroke='#333333' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M8.79199 2.3916C9.2222 2.50175 9.60351 2.75195 9.87581 3.10276C10.1481 3.45356 10.2959 3.88502 10.2959 4.3291C10.2959 4.77319 10.1481 5.20464 9.87581 5.55545C9.60351 5.90625 9.2222 6.15645 8.79199 6.2666' stroke='#333333' strokeLinecap='round' strokeLinejoin='round' />
        </g>
        <defs>
          <clipPath id='clip0_9916_27706'>
            <rect width='12' height='12' fill='white' transform='translate(0.791992 0.82666)' />
          </clipPath>
        </defs>
      </svg>
    ), description: 'Personalized setup with your bookkeeper' },
    { icon: (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
        <g clipPath='url(#clip0_9916_27714)'>
          <path d='M2.5 12.2915C2.5 11.8771 2.66462 11.4797 2.95765 11.1866C3.25067 10.8936 3.6481 10.729 4.0625 10.729H12.5M2.5 12.2915C2.5 12.7059 2.66462 13.1033 2.95765 13.3964C3.25067 13.6894 3.6481 13.854 4.0625 13.854H12.5V1.354H4.0625C3.6481 1.354 3.25067 1.51862 2.95765 1.81165C2.66462 2.10468 2.5 2.5021 2.5 2.9165V12.2915Z' stroke='#333333' strokeLinecap='round' strokeLinejoin='round' />
        </g>
        <defs>
          <clipPath id='clip0_9916_27714'>
            <rect width='15' height='15' fill='white' transform='translate(0 0.104004)' />
          </clipPath>
        </defs>
      </svg>
    ), description: 'Monthly books done for you' },
    { icon: (
      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg' className='Layer__service-offering-options__icon'>
        <g clipPath='url(#clip0_9916_27718)'>
          <path d='M2.04375 4.52352L7.5 7.67977L12.9562 4.52352M7.5 13.9735V7.67352M13.125 10.1735V5.17352C13.1248 4.95432 13.0669 4.73903 12.9572 4.54925C12.8475 4.35947 12.6898 4.20187 12.5 4.09227L8.125 1.59227C7.93498 1.48256 7.71942 1.4248 7.5 1.4248C7.28058 1.4248 7.06502 1.48256 6.875 1.59227L2.5 4.09227C2.31016 4.20187 2.15249 4.35947 2.04279 4.54925C1.93309 4.73903 1.87522 4.95432 1.875 5.17352V10.1735C1.87522 10.3927 1.93309 10.608 2.04279 10.7978C2.15249 10.9876 2.31016 11.1452 2.5 11.2548L6.875 13.7548C7.06502 13.8645 7.28058 13.9222 7.5 13.9222C7.71942 13.9222 7.93498 13.8645 8.125 13.7548L12.5 11.2548C12.6898 11.1452 12.8475 10.9876 12.9572 10.7978C13.0669 10.608 13.1248 10.3927 13.125 10.1735Z' stroke='#333333' strokeLinecap='round' strokeLinejoin='round' />
        </g>
        <defs>
          <clipPath id='clip0_9916_27718'>
            <rect width='15' height='15' fill='white' transform='translate(0 0.17334)' />
          </clipPath>
        </defs>
      </svg>
    ), description: 'Complete financial reports and end of year tax packet' },
  ],
  unit: '/month',
  pricing: '$599',
  valueProposition: bookkeepingValueProps,
}
