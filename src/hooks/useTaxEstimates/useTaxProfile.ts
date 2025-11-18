import useSWR from 'swr'
import { Schema } from 'effect'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { getTaxProfile } from '@api/layer/taxEstimates'
import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'
import { TaxProfileResponseSchema } from '@schemas/taxEstimates'

type UseTaxProfileOptions = {
  useMockData?: boolean
}

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${TAX_ESTIMATES_TAG_KEY}#profile`],
    } as const
  }
}

export function useTaxProfile({ useMockData = false }: UseTaxProfileOptions = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }) => {
      if (useMockData) {
        return Schema.decodeUnknownSync(TaxProfileResponseSchema)({
          data: {
            general_information: {
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone_personal: '+1-555-123-4567',
              date_of_birth: '1985-06-15',
              ssn: '****5678',
            },
            profile: {
              work_description: 'Software Consultant',
              filing_status: 'single' as const,
              us_state: 'CA',
              canadian_province: null,
            },
          },
        })
      }

      return getTaxProfile(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
          },
        },
      )().then(Schema.decodeUnknownPromise(TaxProfileResponseSchema))
    },
  )
}
