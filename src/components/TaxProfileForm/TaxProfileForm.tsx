import { useCallback } from 'react'
import { AlertTriangle, CheckCircle, Save } from 'lucide-react'
import type React from 'react'

import { type TaxProfile } from '@schemas/taxEstimates/profile'
import { flattenValidationErrors } from '@utils/form'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { DeductionsSection } from '@components/TaxProfileForm/sections/DeductionsSection'
import { FederalTaxSection } from '@components/TaxProfileForm/sections/FederalTaxSection'
import { StateTaxSection } from '@components/TaxProfileForm/sections/StateTaxSection'
import { useTaxProfileForm } from '@components/TaxProfileForm/useTaxProfileForm'
import { TextSize } from '@components/Typography/Text'

import './taxProfileForm.scss'

type TaxProfileFormProps = {
  taxProfile?: TaxProfile | null
  isReadOnly?: boolean
  onSuccess?: (profile: TaxProfile) => void
}

export const TaxProfileForm = ({ taxProfile, onSuccess, isReadOnly }: TaxProfileFormProps) => {
  const { form, submitError, submitSuccess } = useTaxProfileForm({ taxProfile, onSuccess })
  const { isDesktop } = useSizeClass()

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className='Layer__TaxProfileForm' onSubmit={blockNativeOnSubmit}>
      <VStack className='Layer__TaxProfileForm__Content' gap='lg' pi='md' pb='md'>
        <FederalTaxSection form={form} isReadOnly={isReadOnly} isDesktop={isDesktop} />
        <StateTaxSection form={form} isReadOnly={isReadOnly} isDesktop={isDesktop} />
        <DeductionsSection form={form} isReadOnly={isReadOnly} isDesktop={isDesktop} />

        <HStack align='center'>
          <form.Subscribe selector={state => ({ errorMap: state.errorMap, isDirty: state.isDirty })}>
            {({ errorMap, isDirty }) => {
              const validationErrors = flattenValidationErrors(errorMap)
              if (validationErrors.length > 0 || submitError) {
                return (
                  <DataState
                    icon={<AlertTriangle size={16} />}
                    status={DataStateStatus.failed}
                    title={validationErrors[0] || submitError}
                    titleSize={TextSize.md}
                    inline
                  />
                )
              }
              if (submitSuccess && !isDirty) {
                return (
                  <DataState
                    icon={<CheckCircle size={16} />}
                    status={DataStateStatus.success}
                    title={submitSuccess}
                    titleSize={TextSize.md}
                    inline
                  />
                )
              }
            }}
          </form.Subscribe>
          <Spacer />
          <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type='submit'
                isDisabled={!canSubmit || isReadOnly}
                isPending={isSubmitting}
                onPress={() => { void form.handleSubmit() }}
              >
                <Save size={14} />
                Save Tax Profile
              </Button>
            )}
          </form.Subscribe>
        </HStack>
      </VStack>
    </Form>
  )
}
