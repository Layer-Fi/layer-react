import { USState } from '@internal-types/location'

export type WorkDescription = 'freelancer' | 'travel-services' | 'other'
export type FilingStatus = 'single' | 'married-joint' | 'married-separate' | 'head-of-household' | 'qualifying-widow'
export type LocationType = 'us' | 'canada'

export interface TaxFilingGeneralInformation {
  address1: string
  address2: string
  city: string
  state: USState | null
  zip: string
  phonePersonal: string
  dateOfBirth: Date | null
  ssn: string
}

export interface TaxFilingProfile {
  workDescription: WorkDescription | null
  filingStatus: FilingStatus | null
  locationType: LocationType
  usState: USState | null
  canadianProvince: string | null
}

export interface TaxFilingDetails {
  general_information: TaxFilingGeneralInformation
  profile: TaxFilingProfile
}

export type { USState }
