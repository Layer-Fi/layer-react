import { useForm, FormValidateOrFn, FormAsyncValidateOrFn } from '@tanstack/react-form'
import { useLayerContext } from '../../contexts/LayerContext'
import { sleep } from '../../utils/helpers'
import { USState } from '../../types/location'
import { EntityType } from '../../types/business'

type BusinessFormData = {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  legal_name?: string
  dba?: string
  entity_type?: EntityType
  us_state?: USState
  tin?: string
}

export const useBusinessForm = () => {
  const { business } = useLayerContext()
  const form = useForm<
    BusinessFormData,
    FormValidateOrFn<BusinessFormData>,
    FormValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn < BusinessFormData >> ({
    defaultValues: {
      phone_number: business?.phone_number,
      legal_name: business?.legal_name,
      entity_type: business?.entity_type,
      us_state: business?.us_state,
      tin: business?.tin,
    },
    onSubmit: async ({ value }) => {
      console.log('onSubmit - sending...', value)
      await sleep(3000)
    },
  })

  return { form }
}
