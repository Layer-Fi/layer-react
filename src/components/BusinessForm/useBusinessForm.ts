import { useForm, FormValidateOrFn, FormAsyncValidateOrFn, useStore } from '@tanstack/react-form'
import { useLayerContext } from '../../contexts/LayerContext'
import { USStateCode } from '../../types/location'
import { EntityType } from '../../types/business'
import { useBusinessPersonnel } from '../../hooks/businessPersonnel/useBusinessPersonnel'
import { useCreateBusinessPersonnel } from '../../hooks/businessPersonnel/useCreateBusinessPersonnel'
import { BusinessPersonnel } from '../../hooks/businessPersonnel/types'
import { useUpdateBusinessPersonnel } from '../../hooks/businessPersonnel/useUpdateBusinessPersonnel'
import { useUpdateBusiness } from '../../hooks/business/useUpdateBusiness'
import { useState } from 'react'

type BusinessFormData = {
  full_name?: string
  preferred_name?: string
  email?: string
  phone_number?: string
  legal_name?: string
  dba?: string
  entity_type?: EntityType
  us_state?: USStateCode
  tin?: string
}

const getPerson = (personnel?: BusinessPersonnel[]) => {
  const owners = personnel?.filter(p => p.roles.find(x => x.role === 'OWNER'))

  if (owners && owners.length > 0) {
    return owners[0]
  }

  return personnel?.[0]
}

type UseBusinessFormProps = {
  onSuccess?: () => void
}

export const useBusinessForm = ({ onSuccess }: UseBusinessFormProps) => {
  const { business } = useLayerContext()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  const { data: personnel } = useBusinessPersonnel()
  const person = getPerson(personnel)

  const { trigger: createBusinessPersonnel } = useCreateBusinessPersonnel()
  const { trigger: updateBusinessPersonnel } = useUpdateBusinessPersonnel({ businessPersonnelId: person?.id })
  const { trigger: updateBusiness } = useUpdateBusiness()

  const form = useForm<
    BusinessFormData,
    FormValidateOrFn<BusinessFormData>,
    FormValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>,
    FormAsyncValidateOrFn<BusinessFormData>> ({
    defaultValues: {
      full_name: person?.fullName ?? undefined,
      preferred_name: person?.preferredName ?? undefined,
      phone_number: person?.phoneNumbers?.[0]?.phoneNumber as string | undefined,
      email: person?.emailAddresses?.[0]?.emailAddress as string | undefined,
      legal_name: business?.legal_name ?? undefined,
      entity_type: business?.entity_type ?? undefined,
      us_state: business?.us_state ?? undefined,
      tin: business?.tin,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(undefined)

        if (person) {
          await updateBusinessPersonnel({
            id: person.id,
            full_name: value.full_name,
            preferred_name: value.preferred_name,
            email_addresses: value.email ? [{ email_address: value.email }] : [],
            phone_numbers: value.phone_number ? [{ phone_number: value.phone_number }] : [],
          })
        }
        else {
          if (value.full_name) {
            await createBusinessPersonnel({
              full_name: value.full_name,
              preferred_name: value.preferred_name ?? null,
              email_addresses: value.email ? [{ email_address: value.email }] : [],
              phone_numbers: value.phone_number ? [{ phone_number: value.phone_number }] : [],
              external_id: null,
              roles: [{ role: 'OWNER' }],
            })
          }
        }

        await updateBusiness({
          legal_name: value.legal_name,
          entity_type: value.entity_type,
          us_state: value.us_state,
          tin: value.tin,
        })

        onSuccess?.()
      }
      catch {
        setSubmitError('Something went wrong. Please try again.')
      }
    },
  })

  const isFormValid = useStore(form.store, state => state.isValid)

  return { form, submitError, isFormValid }
}
