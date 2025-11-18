import { useReducer, useEffect, useState, useCallback } from 'react'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { Toggle } from '@components/Toggle/Toggle'
import { View } from '@components/View/View'
import { Container } from '@components/Container/Container'
import { SubmitButton } from '@components/Button/SubmitButton'
import { VStack, HStack } from '@ui/Stack/Stack'
import { ComboBox } from '@components/ui/ComboBox/ComboBox'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuList, MenuItem } from '@ui/DropdownMenu/DropdownMenu'
import MoreVertical from '@icons/MoreVertical'
import { TaxEstimateGeneralInformation } from './TaxEstimateGeneralInformation'
import { TaxEstimateProfile } from './TaxEstimateProfile'
import { TaxEstimateSummary } from './TaxEstimateSummary'
import { TaxPayments } from './TaxPayments'
import { TaxEstimateOverview } from './TaxEstimateOverview'
import './taxEstimateView.scss'
import { Separator } from '@components/Separator/Separator'
import { reducer, initialState } from './store'
import { useTaxEstimates, useTaxPayments } from '@hooks/useTaxEstimates'

interface TaxEstimateViewProps {
  onNavigateToBankTransactions?: () => void
}

type YearOption = {
  label: string
  value: string
}

const yearOptions: YearOption[] = [
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
]

export const TaxEstimateView = ({ onNavigateToBankTransactions }: TaxEstimateViewProps = {}) => {
  const [isOnboarded, setIsOnboarded] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tax-estimates' | 'tax-payments' | 'tax-profile'>('overview')
  const [taxEstimateDetails, dispatch] = useReducer(reducer, initialState)
  const [federalSectionExpanded, setFederalSectionExpanded] = useState(false)
  const [stateSectionExpanded, setStateSectionExpanded] = useState(false)
  const [paymentsSectionExpanded, setPaymentsSectionExpanded] = useState(false)
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(yearOptions[0])

  const { data: taxEstimatesData } = useTaxEstimates({
    year: selectedYear ? parseInt(selectedYear.value) : undefined,
    useMockData: true,
  })
  const { data: taxPaymentsData } = useTaxPayments({
    year: selectedYear ? parseInt(selectedYear.value) : undefined,
    useMockData: true,
  })

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

  const { general_information, profile } = taxEstimateDetails

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

  const handleFederalTaxesOwedClick = () => {
    setActiveTab('tax-estimates')
    requestAnimationFrame(() => {
      setStateSectionExpanded(false)
      setPaymentsSectionExpanded(false)
      setFederalSectionExpanded(true)
    })
  }

  const handleFederalTaxesPaidClick = () => {
    setActiveTab('tax-payments')
    requestAnimationFrame(() => {
      setFederalSectionExpanded(false)
      setStateSectionExpanded(false)
      setPaymentsSectionExpanded(true)
    })
  }

  const handleStateTaxesOwedClick = () => {
    setActiveTab('tax-estimates')
    requestAnimationFrame(() => {
      setFederalSectionExpanded(false)
      setPaymentsSectionExpanded(false)
      setStateSectionExpanded(true)
    })
  }

  const handleStateTaxesPaidClick = () => {
    setActiveTab('tax-payments')
    requestAnimationFrame(() => {
      setFederalSectionExpanded(false)
      setStateSectionExpanded(false)
      setPaymentsSectionExpanded(true)
    })
  }

  const handleFederalSectionExpandedChange = (expanded: boolean) => {
    if (expanded) {
      setStateSectionExpanded(false)
      setPaymentsSectionExpanded(false)
    }
    setFederalSectionExpanded(expanded)
  }

  const handleStateSectionExpandedChange = (expanded: boolean) => {
    if (expanded) {
      setFederalSectionExpanded(false)
      setPaymentsSectionExpanded(false)
    }
    setStateSectionExpanded(expanded)
  }

  const handlePaymentsSectionExpandedChange = (expanded: boolean) => {
    if (expanded) {
      setFederalSectionExpanded(false)
      setStateSectionExpanded(false)
    }
    setPaymentsSectionExpanded(expanded)
  }

  const MenuTrigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MoreVertical size={14} />
      </Button>
    )
  }, [])

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title='Taxes'
        showHeader={true}
        headerActions={(
          <HStack gap='sm' align='center' className='Layer__tax-estimate-view__header-actions'>
            <ComboBox
              selectedValue={selectedYear}
              onSelectedValueChange={setSelectedYear}
              options={yearOptions}
              isClearable={false}
              isSearchable={false}
            />
            <DropdownMenu
              ariaLabel='Tax filing options'
              slots={{ Trigger: MenuTrigger }}
              slotProps={{ Dialog: { width: 200 } }}
              variant='compact'
            >
              <MenuList>
                <MenuItem>
                  Tax Profile
                </MenuItem>
              </MenuList>
            </DropdownMenu>
          </HStack>
        )}
      >
        <Toggle
          key={`tax-estimate-toggle-${isOnboarded}-${activeTab}`}
          name='tax-estimate-tabs'
          options={[
            {
              value: 'overview',
              label: 'Overview',
            },
            {
              value: 'tax-estimates',
              label: 'Estimates',
              disabled: !isOnboarded,
              disabledMessage: 'Please complete your tax profile first',
            },
            {
              value: 'tax-payments',
              label: 'Payments',
              disabled: !isOnboarded,
              disabledMessage: 'Please complete your tax profile first',
            },
            // {
            //   value: 'tax-profile',
            //   label: 'Tax Profile',
            //   leftIcon: isOnboarded
            //     ? <CheckCircle size={16} />
            //     : <UserCircle size={16} />,
            // },
          ]}
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value as typeof activeTab)}
        />

        <Container name='tax-estimate'>
          {activeTab === 'overview' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxEstimateOverview onNavigateToBankTransactions={onNavigateToBankTransactions} />
            </VStack>
          )}

          {activeTab === 'tax-estimates' && taxEstimatesData && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxEstimateSummary
                projectedTaxesOwed={taxEstimatesData.data.projectedTaxesOwed}
                taxesDueDate={new Date(taxEstimatesData.data.taxesDueDate)}
                federalTaxesOwed={taxEstimatesData.data.federalTaxes.taxesOwed}
                federalTaxesPaid={taxEstimatesData.data.federalTaxes.taxesPaid}
                stateTaxesOwed={taxEstimatesData.data.stateTaxes.taxesOwed}
                stateTaxesPaid={taxEstimatesData.data.stateTaxes.taxesPaid}
                quarterlyEstimates={taxEstimatesData.data.quarterlyEstimates.map(q => ({
                  quarter: q.quarter,
                  amount: q.amount,
                }))}
                onFederalTaxesOwedClick={handleFederalTaxesOwedClick}
                onFederalTaxesPaidClick={handleFederalTaxesPaidClick}
                onStateTaxesOwedClick={handleStateTaxesOwedClick}
                onStateTaxesPaidClick={handleStateTaxesPaidClick}
                federalSectionExpanded={federalSectionExpanded}
                onFederalSectionExpandedChange={handleFederalSectionExpandedChange}
                stateSectionExpanded={stateSectionExpanded}
                onStateSectionExpandedChange={handleStateSectionExpandedChange}
              />
            </VStack>
          )}

          {activeTab === 'tax-payments' && taxPaymentsData && taxEstimatesData && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxPayments
                quarterlyPayments={taxPaymentsData.data.quarters.map(q => ({
                  quarter: q.quarter,
                  amount: q.totalPaid,
                }))}
                quarterlyEstimates={taxEstimatesData.data.quarterlyEstimates.map(q => ({
                  quarter: q.quarter,
                  amount: q.amount,
                }))}
                paymentsSectionExpanded={paymentsSectionExpanded}
                onPaymentsSectionExpandedChange={handlePaymentsSectionExpandedChange}
                onNavigateToBankTransactions={onNavigateToBankTransactions}
              />
            </VStack>
          )}

          {activeTab === 'tax-profile' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxEstimateGeneralInformation
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
              <TaxEstimateProfile
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
