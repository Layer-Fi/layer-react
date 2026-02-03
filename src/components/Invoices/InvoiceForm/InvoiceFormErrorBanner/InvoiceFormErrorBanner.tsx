import { AlertTriangle } from 'lucide-react'

import { flattenValidationErrors } from '@utils/form'
import { HStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TextSize } from '@components/Typography/Text'
import { useFormContext } from '@features/forms/hooks/useForm'

import './invoiceFormErrorBanner.scss'

type InvoiceFormErrorBannerProps = {
  submitError?: string
}

export const InvoiceFormErrorBanner = ({ submitError }: InvoiceFormErrorBannerProps) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={state => state.errorMap}>
      {(errorMap) => {
        const validationErrors = flattenValidationErrors(errorMap)
        if (validationErrors.length > 0 || submitError) {
          return (
            <HStack className='Layer__InvoiceForm__FormError'>
              <DataState
                icon={<AlertTriangle size={16} />}
                status={DataStateStatus.failed}
                title={validationErrors[0] || submitError}
                titleSize={TextSize.md}
                inline
              />
            </HStack>
          )
        }
      }}
    </form.Subscribe>
  )
}
