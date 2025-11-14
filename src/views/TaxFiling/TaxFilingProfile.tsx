import { VStack } from '@ui/Stack/Stack'
import { InputGroup } from '@components/Input/InputGroup'
import { Select } from '@components/Input/Select'
import { USStateSelect } from '@components/Input/USStateSelect'
import { BaseSelectOption } from '@internal-types/general'
import { USState } from '@internal-types/location'
import { Heading } from '@components/ui/Typography/Heading'

type WorkDescription = 'freelancer' | 'travel-services' | 'other'
type FilingStatus = 'single' | 'married-joint' | 'married-separate' | 'head-of-household' | 'qualifying-widow'
type LocationType = 'us' | 'canada'

const workDescriptionOptions: BaseSelectOption[] = [
  { value: 'freelancer', label: 'Freelancer/Consultant' },
  { value: 'travel-services', label: 'I provide services and travel to clients' },
  { value: 'other', label: 'Other' },
]

const filingStatusOptions: BaseSelectOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'married-joint', label: 'Married Filing Jointly' },
  { value: 'married-separate', label: 'Married Filing Separately' },
  { value: 'head-of-household', label: 'Head of Household' },
  { value: 'qualifying-widow', label: 'Qualifying Widow(er)' },
]

const canadianProvincesOptions: BaseSelectOption[] = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
]

export interface TaxFilingProfileProps {
  workDescription: WorkDescription | null
  filingStatus: FilingStatus | null
  locationType: LocationType
  usState: USState | null
  canadianProvince: string | null
  onWorkDescriptionChange: (value: WorkDescription) => void
  onFilingStatusChange: (value: FilingStatus) => void
  onLocationTypeChange: (value: LocationType) => void
  onUsStateChange: (state: USState | null) => void
  onCanadianProvinceChange: (value: string | null) => void
}

export const TaxFilingProfile = ({
  workDescription,
  filingStatus,
  locationType,
  usState,
  canadianProvince,
  onWorkDescriptionChange,
  onFilingStatusChange,
  onLocationTypeChange,
  onUsStateChange,
  onCanadianProvinceChange,
}: TaxFilingProfileProps) => {
  return (
    <VStack gap='md'>
      <Heading size='lg'>Tax Profile</Heading>
      <InputGroup name='work-description' label='What best describes your work?'>
        <Select
          options={workDescriptionOptions}
          value={workDescriptionOptions.find(opt => opt.value === workDescription) || null}
          onChange={option => onWorkDescriptionChange(option?.value as WorkDescription)}
          placeholder='Select...'
        />
      </InputGroup>

      <InputGroup name='filing-status' label='Select filing status'>
        <Select
          options={filingStatusOptions}
          value={filingStatusOptions.find(opt => opt.value === filingStatus) || null}
          onChange={option => onFilingStatusChange(option?.value as FilingStatus)}
          placeholder='Select...'
        />
      </InputGroup>

      <InputGroup name='location-type' label='Select location type'>
        <Select
          options={[
            { value: 'us', label: 'US State' },
            { value: 'canada', label: 'Canadian Province' },
          ]}
          value={{ value: locationType, label: locationType === 'us' ? 'US State' : 'Canadian Province' }}
          onChange={(option) => {
            const newLocationType = option?.value as LocationType
            onLocationTypeChange(newLocationType)
            if (newLocationType === 'us') {
              onCanadianProvinceChange(null)
            }
            else {
              onUsStateChange(null)
            }
          }}
        />
      </InputGroup>

      {locationType === 'us'
        ? (
          <InputGroup name='us-state' label='Select state (US)'>
            <USStateSelect
              value={usState?.value}
              onChange={onUsStateChange}
            />
          </InputGroup>
        )
        : (
          <InputGroup name='canadian-province' label='Select province (Canada)'>
            <Select
              options={canadianProvincesOptions}
              value={canadianProvincesOptions.find(opt => opt.value === canadianProvince) || null}
              onChange={option => onCanadianProvinceChange(option?.value as string)}
              placeholder='Select...'
            />
          </InputGroup>
        )}
    </VStack>
  )
}
