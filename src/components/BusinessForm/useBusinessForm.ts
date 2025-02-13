import { useForm } from '@tanstack/react-form'
import { useLayerContext } from '../../contexts/LayerContext'
import { sleep } from '../../utils/helpers'

type BusinessFormData = {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  legal_name?: string
  dba?: string
  type?: string
  us_state?: string
  tin?: string
}

export const useBusinessForm = () => {
  const { business } = useLayerContext()
  const form = useForm<BusinessFormData>({
    defaultValues: {
      phone_number: business?.phone_number,
      legal_name: business?.legal_name,
      type: business?.type,
      us_state: business?.us_state,
      tin: business?.tin,
    },
    onSubmit: async ({ value }) => {
      console.log('onSubmit - sending...', value)
      await sleep(1000)
    },
  })

  return { form }
}
