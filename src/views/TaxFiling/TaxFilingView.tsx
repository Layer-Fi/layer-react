import { useReducer, useEffect, useState } from 'react'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { Toggle } from '@components/Toggle/Toggle'
import { View } from '@components/View/View'
import { Container } from '@components/Container/Container'
import { SubmitButton } from '@components/Button/SubmitButton'
import { VStack, HStack } from '@ui/Stack/Stack'
import { UserCircle, CheckCircle } from 'lucide-react'
import { TaxFilingGeneralInformation } from './TaxFilingGeneralInformation'
import { TaxFilingProfile } from './TaxFilingProfile'
import { TaxEstimate } from './TaxEstimate'
import { TaxPayments } from './TaxPayments'
import { TaxFilingOverview } from './TaxFilingOverview'
import './taxFilingView.scss'
import { Separator } from '@components/Separator/Separator'
import { reducer, initialState } from './store'

export const TaxFilingView = () => {
  const [isOnboarded, setIsOnboarded] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tax-estimates' | 'tax-payments' | 'tax-profile'>('overview')
  const [taxFilingDetails, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!isOnboarded) {
      setActiveTab('tax-profile')
    }
  }, [isOnboarded])

  const handleSave = () => {
    setIsOnboarded(true)
    requestAnimationFrame(() => {
      setActiveTab('tax-estimates')
    })
  }

  const { general_information, profile } = taxFilingDetails

  const isFormValid = profile.workDescription !== null
    && profile.filingStatus !== null
    && (profile.locationType === 'us' ? profile.usState !== null : profile.canadianProvince !== null)
    && general_information.address1 !== ''
    && general_information.city !== ''
    && general_information.state !== null
    && general_information.zip !== ''
    && general_information.phonePersonal !== ''
    && general_information.dateOfBirth !== null
    && general_information.ssn !== ''

  return (
    <ProfitAndLoss asContainer={false}>
      <View title='Tax Filing' showHeader={true}>
        <Toggle
          key={`tax-filing-toggle-${isOnboarded}-${activeTab}`}
          name='tax-filing-tabs'
          options={[
            {
              value: 'overview',
              label: 'Overview',
            },
            {
              value: 'tax-estimates',
              label: 'Tax Estimates',
              disabled: !isOnboarded,
              disabledMessage: 'Please complete your tax profile first',
            },
            {
              value: 'tax-payments',
              label: 'Tax Payments',
              disabled: !isOnboarded,
              disabledMessage: 'Please complete your tax profile first',
            },
            {
              value: 'tax-profile',
              label: 'Tax Profile',
              leftIcon: isOnboarded
                ? <CheckCircle size={16} />
                : <UserCircle size={16} />,
            },
          ]}
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value as typeof activeTab)}
        />

        <Container name='tax-filing'>
          {activeTab === 'overview' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxFilingOverview />
            </VStack>
          )}

          {activeTab === 'tax-estimates' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxEstimate />
            </VStack>
          )}

          {activeTab === 'tax-payments' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxPayments
                taxEstimateAnnualProjectionProps={{
                  projectedTaxesOwed: 10000,
                  taxesDueDate: new Date(),
                  federalTaxesOwed: 10000,
                  federalTaxesPaid: 10000,
                  stateTaxesOwed: 10000,
                  stateTaxesPaid: 10000,
                }}
                quarterlyEstimates={[
                  { quarter: 'Q1', amount: 10000 },
                  { quarter: 'Q2', amount: 10000 },
                  { quarter: 'Q3', amount: 10000 },
                  { quarter: 'Q4', amount: 10000 },
                ]}
              />
            </VStack>
          )}

          {activeTab === 'tax-profile' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxFilingGeneralInformation
                address1={general_information.address1}
                address2={general_information.address2}
                city={general_information.city}
                state={general_information.state}
                zip={general_information.zip}
                phonePersonal={general_information.phonePersonal}
                dateOfBirth={general_information.dateOfBirth}
                ssn={general_information.ssn}
                onAddress1Change={value => dispatch({ type: 'SET_ADDRESS1', payload: value })}
                onAddress2Change={value => dispatch({ type: 'SET_ADDRESS2', payload: value })}
                onCityChange={value => dispatch({ type: 'SET_CITY', payload: value })}
                onStateChange={value => dispatch({ type: 'SET_STATE', payload: value })}
                onZipChange={value => dispatch({ type: 'SET_ZIP', payload: value })}
                onPhonePersonalChange={value => dispatch({ type: 'SET_PHONE_PERSONAL', payload: value || '' })}
                onDateOfBirthChange={value => dispatch({ type: 'SET_DATE_OF_BIRTH', payload: value })}
                onSsnChange={value => dispatch({ type: 'SET_SSN', payload: value })}
              />
              <Separator mbe='lg' mbs='md' />
              <TaxFilingProfile
                workDescription={profile.workDescription}
                filingStatus={profile.filingStatus}
                locationType={profile.locationType}
                usState={profile.usState}
                canadianProvince={profile.canadianProvince}
                onWorkDescriptionChange={value => dispatch({ type: 'SET_WORK_DESCRIPTION', payload: value })}
                onFilingStatusChange={value => dispatch({ type: 'SET_FILING_STATUS', payload: value })}
                onLocationTypeChange={value => dispatch({ type: 'SET_LOCATION_TYPE', payload: value })}
                onUsStateChange={value => dispatch({ type: 'SET_US_STATE', payload: value })}
                onCanadianProvinceChange={value => dispatch({ type: 'SET_CANADIAN_PROVINCE', payload: value })}
              />

              <HStack justify='start' fluid>
                <SubmitButton
                  onClick={handleSave}
                  disabled={!isFormValid}
                >
                  Save and redirect to tax estimates
                </SubmitButton>
              </HStack>
            </VStack>
          )}
        </Container>
      </View>
    </ProfitAndLoss>
  )
}
