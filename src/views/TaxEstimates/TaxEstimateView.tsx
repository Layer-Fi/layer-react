import { useCallback, useEffect, useReducer, useState } from 'react'

import { useTaxPayments } from '@hooks/useTaxEstimates'
import MoreVertical from '@icons/MoreVertical'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { SubmitButton } from '@components/Button/SubmitButton'
import { Container } from '@components/Container/Container'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { Separator } from '@components/Separator/Separator'
import { ComboBox } from '@components/ui/ComboBox/ComboBox'
import { View } from '@components/View/View'

import './taxEstimateView.scss'

import { initialState, reducer } from './store'
import { TaxEstimateGeneralInformation } from './TaxEstimateGeneralInformation'
import { TaxEstimateOverview } from './TaxEstimateOverview'
import { TaxEstimateProfile } from './TaxEstimateProfile'
import { TaxEstimateSummary } from './TaxEstimateSummary'
import { TaxPayments } from './TaxPayments'

interface TaxEstimateViewProps {
  onNavigateToBankTransactions?: () => void
}

type YearOption = {
  label: string
  value: string
}

const currentYear = new Date().getFullYear()

const yearOptions: YearOption[] = [
  { label: currentYear.toString(), value: currentYear.toString() },
  { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
  { label: (currentYear - 2).toString(), value: (currentYear - 2).toString() },
]

export const TaxEstimateView = ({ onNavigateToBankTransactions }: TaxEstimateViewProps = {}) => {
  const [isOnboarded, setIsOnboarded] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tax-estimates' | 'tax-payments' | 'tax-profile'>('overview')
  const [taxEstimateDetails, dispatch] = useReducer(reducer, initialState)
  const [federalSectionExpanded, setFederalSectionExpanded] = useState(false)
  const [stateSectionExpanded, setStateSectionExpanded] = useState(false)
  const [paymentsSectionExpanded, setPaymentsSectionExpanded] = useState(false)
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(yearOptions[0])

  const year = selectedYear ? parseInt(selectedYear.value) : currentYear

  const { data: taxPaymentsData } = useTaxPayments({
    year,
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
          ariaLabel='Tax estimate tabs'
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
          selectedKey={activeTab}
          onSelectionChange={key => setActiveTab(key as typeof activeTab)}
        />

        <Container name='tax-estimate'>
          {activeTab === 'overview' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxEstimateOverview year={year} onNavigateToBankTransactions={onNavigateToBankTransactions} />
            </VStack>
          )}

          {activeTab === 'tax-estimates' && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxEstimateSummary
                year={year}
                projectedTaxesOwed={undefined}
                taxesDueDate={undefined}
                federalTaxesOwed={undefined}
                federalTaxesPaid={undefined}
                stateTaxesOwed={undefined}
                stateTaxesPaid={undefined}
                quarterlyEstimates={[]}
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

          {activeTab === 'tax-payments' && taxPaymentsData && (
            <VStack gap='md' pb='lg' pi='lg'>
              <TaxPayments
                quarterlyData={taxPaymentsData.data.quarters.map(q => ({
                  quarter: `Q${q.quarter}`,
                  rolledOver: q.owedRolledOverFromPrevious / 100,
                  owed: q.owedThisQuarter / 100,
                  paid: q.totalPaid / 100,
                  total: q.total / 100,
                }))}
                paymentsSectionExpanded={paymentsSectionExpanded}
                onPaymentsSectionExpandedChange={handlePaymentsSectionExpandedChange}
                onNavigateToBankTransactions={onNavigateToBankTransactions}
                year={year}
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
