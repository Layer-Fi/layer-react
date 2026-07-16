import { parseCsv, type ParseCsvResponseEncoded } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/parseCsv'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/custom-accounts/:customAccountId/parse-csv',
  resolve: async ({ override, request }: { override?: ParseCsvResponseEncoded, request: Request }) => {
    if (override) return apiData(override)

    const file = (await request.formData()).get('file')
    const text = file instanceof File ? await file.text() : ''

    return apiData(parseCsv(text))
  },
})
