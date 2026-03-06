import { flattenValidationErrors } from '@utils/form'
import { FormErrorBanner } from '@components/FormErrorBanner/FormErrorBanner'
import { useFormContext } from '@features/forms/hooks/useForm'

type InvoiceFormErrorBannerProps = {
  submitError?: string
}

export const InvoiceFormErrorBanner = ({ submitError }: InvoiceFormErrorBannerProps) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={state => state.errorMap}>
      {(errorMap) => {
        const validationErrors = flattenValidationErrors(errorMap)
        const message = validationErrors[0] || submitError
        return message ? <FormErrorBanner message={message} /> : null
      }}
    </form.Subscribe>
  )
}
