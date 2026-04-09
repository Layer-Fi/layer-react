import { useCallback } from 'react'
import { AlertTriangle, CheckCircle, Save } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'

import { type TaxProfile } from '@schemas/taxEstimates/profile'
import { flattenValidationErrors } from '@utils/form'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { Form } from '@ui/Form/Form'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { DeductionsSection } from '@components/TaxProfileForm/sections/DeductionsSection'
import { FederalTaxSection } from '@components/TaxProfileForm/sections/FederalTaxSection'
import { StateTaxSection } from '@components/TaxProfileForm/sections/StateTaxSection'
import { useTaxProfileForm } from '@components/TaxProfileForm/useTaxProfileForm'

import './taxProfileForm.scss'

type TaxProfileFormProps = {
  taxProfile?: TaxProfile | null
  isReadOnly?: boolean
  onSuccess?: (profile: TaxProfile) => void
}

export const TaxProfileForm = ({ taxProfile, onSuccess, isReadOnly }: TaxProfileFormProps) => {
  const { t } = useTranslation()
  const { form, submitError, submitSuccess } = useTaxProfileForm({ taxProfile, onSuccess })
  const { isDesktop } = useSizeClass()

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const formStatusMessage = (
    <form.Subscribe selector={state => ({ errorMap: state.errorMap, isDirty: state.isDirty })}>
      {({ errorMap, isDirty }) => {
        const validationErrors = flattenValidationErrors(errorMap)
        const displayError = validationErrors[0] || submitError

        if (displayError) {
          return (
            <DataState
              icon={<AlertTriangle size={16} />}
              status={DataStateStatus.failed}
              title={displayError}
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
              inline
            />
          )
        }
      }}
    </form.Subscribe>
  )

  const saveProfileButton = (
    <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          type='submit'
          isDisabled={!canSubmit || isReadOnly}
          isPending={isSubmitting}
          onPress={() => { void form.handleSubmit() }}
        >
          <Save size={14} />
          {t('taxEstimates:action.save_profile', 'Save Profile')}
        </Button>
      )}
    </form.Subscribe>
  )

  return (
    <Form className='Layer__TaxProfileForm' onSubmit={blockNativeOnSubmit}>
      <VStack className='Layer__TaxProfileForm__Content' gap='lg' pi='md' pb='md'>
        <FederalTaxSection form={form} isReadOnly={isReadOnly} isDesktop={isDesktop} />
        <StateTaxSection form={form} isReadOnly={isReadOnly} isDesktop={isDesktop} />
        <DeductionsSection form={form} isReadOnly={isReadOnly} isDesktop={isDesktop} />

        <VStack gap='sm'>
          <Span size='sm' variant='subtle'>
            {t(
              'taxEstimates:disclaimer.content',
              'The Tax Estimates tool and related content are for informational purposes only, and are not intended as legal, accounting, or tax advice, or a substitute for professional counsel. We are not a financial planner or tax advisor, and users assume sole responsibility for their tax obligations, accuracy of data, and compliance with laws. All calculations are estimated and may contain errors, and are based only on the information you provide to us.',
            )}
          </Span>
          <form.Field
            name='acknowledgedDisclaimer'
            validators={{
              onSubmit: ({ value }) => {
                if (!value) {
                  return t('taxEstimates:error.disclaimer_required', 'You must acknowledge the disclaimer to continue.')
                }
                return undefined
              },
            }}
          >
            {(field) => {
              const firstError = field.state.meta.errors[0]
              const errorMessage = typeof firstError === 'string' ? firstError : undefined
              const isInvalid = Boolean(errorMessage)

              return (
                <VStack gap='xs'>
                  <Checkbox
                    isSelected={field.state.value ?? false}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    isInvalid={isInvalid}
                    variant={isInvalid ? 'error' : 'default'}
                    isReadOnly={isReadOnly}
                  >
                    <Span size='sm'>
                      {t(
                        'taxEstimates:disclaimer.acknowledgment',
                        'By continuing, I certify that I understand the above.',
                      )}
                    </Span>
                  </Checkbox>
                  {errorMessage
                    ? (
                      <Span size='sm' status='error'>
                        {errorMessage}
                      </Span>
                    )
                    : null}
                </VStack>
              )
            }}
          </form.Field>
        </VStack>

        {isDesktop
          ? (
            <HStack align='center'>
              {formStatusMessage}
              <Spacer />
              {saveProfileButton}
            </HStack>
          )
          : (
            <VStack gap='md'>
              {formStatusMessage}
              {saveProfileButton}
            </VStack>
          )}

      </VStack>
    </Form>
  )
}
