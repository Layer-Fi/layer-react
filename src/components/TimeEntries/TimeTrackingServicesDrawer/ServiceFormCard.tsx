import { type FormEvent, useCallback } from 'react'
import { AlertTriangle, Archive } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { flattenValidationErrors } from '@utils/form'
import { type CatalogService } from '@schemas/catalogService'
import { useServiceForm } from '@hooks/features/timeTracking/useServiceForm'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Span } from '@ui/Typography/Text'
import { TextSize } from '@components/Typography/Text'

type AddServiceFormCardProps = {
  mode: 'create'
  onCancel: () => void
  onSuccess: () => void
  showCancel?: boolean
}

type EditServiceFormCardProps = {
  mode: 'edit'
  service: CatalogService
  onArchive: () => void
  onSuccess: () => void
}

type ServiceFormCardProps = AddServiceFormCardProps | EditServiceFormCardProps

export function ServiceFormCard(props: ServiceFormCardProps) {
  const { t } = useTranslation()
  const { form, submitError } = useServiceForm(props)
  const mode = props.mode
  const isSubmitting = form.state.isSubmitting

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }, [form])

  let actionButtons

  if (mode === 'edit') {
    actionButtons = (
      <HStack gap='sm' align='center' justify='space-between'>
        <Button variant='outlined' onPress={props.onArchive}>
          <Archive size={16} />
          {t('timeTracking:services.archive', 'Archive')}
        </Button>
        <Button onPress={() => { void form.handleSubmit() }} isDisabled={isSubmitting} isPending={isSubmitting}>
          {t('timeTracking:services.save', 'Save')}
        </Button>
      </HStack>
    )
  }
  else {
    actionButtons = (
      <HStack gap='sm' justify='end' align='center'>
        {props.showCancel && (
          <Button variant='outlined' onPress={props.onCancel}>
            {t('timeTracking:services.cancel', 'Cancel')}
          </Button>
        )}
        <Button onPress={() => { void form.handleSubmit() }} isDisabled={isSubmitting} isPending={isSubmitting}>
          {t('timeTracking:services.add', 'Add')}
        </Button>
      </HStack>
    )
  }

  return (
    <Form
      className={
        mode === 'edit'
          ? 'Layer__TimeTrackingServicesDrawer__editForm'
          : 'Layer__TimeTrackingServicesDrawer__addCard'
      }
      onSubmit={onSubmit}
    >
      <VStack gap='md' pb='md' pi='md'>
        <form.Subscribe selector={state => state.errorMap}>
          {(errorMap) => {
            const validationErrors = flattenValidationErrors(errorMap)
            const formError = validationErrors[0] || submitError

            if (!formError) {
              return null
            }

            return (
              <HStack pbe='xs'>
                <DataState
                  icon={<AlertTriangle size={16} />}
                  status={DataStateStatus.failed}
                  title={formError}
                  titleSize={TextSize.md}
                  inline
                />
              </HStack>
            )
          }}
        </form.Subscribe>

        {mode === 'create' && (
          <Span size='sm' weight='bold'>
            {t('timeTracking:services.add_service', 'Add service')}
          </Span>
        )}

        <form.AppField name='name'>
          {field => (
            <field.FormTextField
              label={t('timeTracking:services.service_name', 'Service name')}
              className='Layer__TimeTrackingServicesDrawer__rateField'
            />
          )}
        </form.AppField>

        <form.AppField name='hourlyRate'>
          {field => (
            <field.FormNonRecursiveBigDecimalField
              label={t('timeTracking:services.hourly_rate_optional', 'Default hourly rate (optional)')}
              mode='currency'
              className='Layer__TimeTrackingServicesDrawer__rateField'
            />
          )}
        </form.AppField>

        {actionButtons}
      </VStack>
    </Form>
  )
}
