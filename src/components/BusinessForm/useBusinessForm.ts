import { useForm, FormValidateOrFn, FormAsyncValidateOrFn } from '@tanstack/react-form'
import { useLayerContext } from '../../contexts/LayerContext'
import { sleep } from '../../utils/helpers'
import { USState } from '../../types/location'
import { EntityType } from '../../types/business'
import { useBusinessPersonnel } from '../../hooks/businessPersonnel/useBusinessPersonnel'
import { useCreateBusinessPersonnel } from '../../hooks/businessPersonnel/useCreateBusinessPersonnel'

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

  const { trigger: createBusinessPersonnel } = useCreateBusinessPersonnel()

  const { data: personnel } = useBusinessPersonnel()
  console.log('personnel', personnel)

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
      first_name: personnel?.[0]?.fullName,
      phone_number: personnel?.[0]?.phoneNumbers?.[0]?.phoneNumber,
      email: personnel?.[0]?.emailAddresses?.[0]?.emailAddress,
      legal_name: business?.legal_name,
      entity_type: business?.entity_type,
      us_state: business?.us_state,
      tin: business?.tin,
    },
    onSubmit: async ({ value }) => {
      console.log('onSubmit - sending...', value)
      await sleep(1000)

      await createBusinessPersonnel({
        full_name: `${value.first_name} ${value.last_name}`,
        email_addresses: value.email ? [{ email_address: value.email }] : [],
        phone_numbers: value.phone_number ? [{ phone_number: value.phone_number }] : [],
        preferred_name: null,
        external_id: null,
        roles: [{ role: 'OWNER' }],
      })

      // @TODO - update personnel
      // @TODO - update business
    },
  })

  return { form }
}
