import { TaxFilingDetails, WorkDescription, FilingStatus, LocationType, USState } from './types'
import { US_STATES } from '@internal-types/location'

const californiaState: USState = US_STATES.find(state => state.value === 'CA')!

export type TaxFilingAction =
  | { type: 'SET_GENERAL_INFORMATION', payload: Partial<TaxFilingDetails['general_information']> }
  | { type: 'SET_PROFILE', payload: Partial<TaxFilingDetails['profile']> }
  | { type: 'SET_ADDRESS1', payload: string }
  | { type: 'SET_ADDRESS2', payload: string }
  | { type: 'SET_CITY', payload: string }
  | { type: 'SET_STATE', payload: USState | null }
  | { type: 'SET_ZIP', payload: string }
  | { type: 'SET_PHONE_PERSONAL', payload: string }
  | { type: 'SET_DATE_OF_BIRTH', payload: Date | null }
  | { type: 'SET_SSN', payload: string }
  | { type: 'SET_WORK_DESCRIPTION', payload: WorkDescription | null }
  | { type: 'SET_FILING_STATUS', payload: FilingStatus | null }
  | { type: 'SET_LOCATION_TYPE', payload: LocationType }
  | { type: 'SET_US_STATE', payload: USState | null }
  | { type: 'SET_CANADIAN_PROVINCE', payload: string | null }

export const initialState: TaxFilingDetails = {
  general_information: {
    address1: '44 Montgomery Street',
    address2: '',
    city: 'San Francisco',
    state: californiaState,
    zip: '94104',
    phonePersonal: '415 1234567',
    dateOfBirth: new Date('2001-01-01'),
    ssn: '123456789',
  },
  profile: {
    workDescription: 'freelancer',
    filingStatus: 'single',
    locationType: 'us',
    usState: californiaState,
    canadianProvince: null,
  },
}

export const reducer = (state: TaxFilingDetails, action: TaxFilingAction): TaxFilingDetails => {
  switch (action.type) {
    case 'SET_GENERAL_INFORMATION':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          ...action.payload,
        },
      }
    case 'SET_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      }
    case 'SET_ADDRESS1':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          address1: action.payload,
        },
      }
    case 'SET_ADDRESS2':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          address2: action.payload,
        },
      }
    case 'SET_CITY':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          city: action.payload,
        },
      }
    case 'SET_STATE':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          state: action.payload,
        },
      }
    case 'SET_ZIP':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          zip: action.payload,
        },
      }
    case 'SET_PHONE_PERSONAL':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          phonePersonal: action.payload,
        },
      }
    case 'SET_DATE_OF_BIRTH':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          dateOfBirth: action.payload,
        },
      }
    case 'SET_SSN':
      return {
        ...state,
        general_information: {
          ...state.general_information,
          ssn: action.payload,
        },
      }
    case 'SET_WORK_DESCRIPTION':
      return {
        ...state,
        profile: {
          ...state.profile,
          workDescription: action.payload,
        },
      }
    case 'SET_FILING_STATUS':
      return {
        ...state,
        profile: {
          ...state.profile,
          filingStatus: action.payload,
        },
      }
    case 'SET_LOCATION_TYPE':
      return {
        ...state,
        profile: {
          ...state.profile,
          locationType: action.payload,
          usState: action.payload === 'us' ? state.profile.usState : null,
          canadianProvince: action.payload === 'canada' ? state.profile.canadianProvince : null,
        },
      }
    case 'SET_US_STATE':
      return {
        ...state,
        profile: {
          ...state.profile,
          usState: action.payload,
        },
      }
    case 'SET_CANADIAN_PROVINCE':
      return {
        ...state,
        profile: {
          ...state.profile,
          canadianProvince: action.payload,
        },
      }
    default:
      return state
  }
}
