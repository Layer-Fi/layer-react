import { Direction } from '@internal-types/general'
import { type RawCustomTransaction } from '@schemas/customAccounts'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

type PreviewCellEncoded<T> = { raw: string, parsed: T | null, is_valid: boolean }

type PreviewRowEncoded = {
  date: PreviewCellEncoded<string>
  description: PreviewCellEncoded<string>
  amount: PreviewCellEncoded<number> | null
  external_id: PreviewCellEncoded<string> | null
  reference_number: PreviewCellEncoded<string> | null
  row: number
  is_valid: boolean
}

type ParseCsvResponseEncoded = {
  is_valid: boolean
  new_transactions_preview: PreviewRowEncoded[]
  new_transactions_request: { transactions: RawCustomTransaction[] } | null
  invalid_transactions_count: number
  total_transactions_count: number
}

type CsvColumn = 'date' | 'description' | 'amount' | 'external_id' | 'reference_number'

const splitCsvLine = (line: string) => line.split(',').map(field => field.trim().replace(/^"|"$/g, ''))

const cell = <T>(raw: string, parsed: T | null, isValid: boolean): PreviewCellEncoded<T> =>
  ({ raw, parsed, is_valid: isValid })

const optionalCell = (raw: string | undefined): PreviewCellEncoded<string> | null =>
  raw ? cell(raw, raw, true) : null

/*
 * Naive CSV parsing (no quoted-comma support): enough for fixtures and
 * user-supplied files in stories. Expects a header row with date, description,
 * amount and optional external_id / reference_number columns; falls back to
 * positional order when headers don't match.
 */
const parseCsv = (text: string): ParseCsvResponseEncoded => {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
  const [headerLine, ...rowLines] = lines

  if (!headerLine || rowLines.length === 0) {
    return {
      is_valid: false,
      new_transactions_preview: [],
      new_transactions_request: null,
      invalid_transactions_count: 0,
      total_transactions_count: 0,
    }
  }

  const headers = splitCsvLine(headerLine).map(header => header.toLowerCase().replace(/\s+/g, '_'))
  const columnIndex = (column: CsvColumn, fallback: number) => {
    const index = headers.indexOf(column)
    return index === -1 ? fallback : index
  }

  const indices = {
    date: columnIndex('date', 0),
    description: columnIndex('description', 1),
    amount: columnIndex('amount', 2),
    external_id: columnIndex('external_id', 3),
    reference_number: columnIndex('reference_number', 4),
  }

  const preview: PreviewRowEncoded[] = []
  const transactions: RawCustomTransaction[] = []

  rowLines.forEach((line, index) => {
    const fields = splitCsvLine(line)

    const rawDate = fields[indices.date] ?? ''
    const rawDescription = fields[indices.description] ?? ''
    const rawAmount = fields[indices.amount] ?? ''

    const isDateValid = !Number.isNaN(Date.parse(rawDate))
    const parsedAmount = Number(rawAmount)
    const isAmountValid = rawAmount !== '' && Number.isFinite(parsedAmount)
    const isDescriptionValid = rawDescription.length > 0
    const isRowValid = isDateValid && isAmountValid && isDescriptionValid

    const signedAmountCents = isAmountValid ? Math.round(parsedAmount * 100) : null

    preview.push({
      date: cell(rawDate, isDateValid ? rawDate : null, isDateValid),
      description: cell(rawDescription, isDescriptionValid ? rawDescription : null, isDescriptionValid),
      amount: cell(rawAmount, signedAmountCents, isAmountValid),
      external_id: optionalCell(fields[indices.external_id]),
      reference_number: optionalCell(fields[indices.reference_number]),
      row: index + 1,
      is_valid: isRowValid,
    })

    if (isRowValid && signedAmountCents != null) {
      transactions.push({
        external_id: fields[indices.external_id] || null,
        amount: Math.abs(signedAmountCents),
        // Negative CSV amounts are outflows (purchases) => DEBIT; positive are inflows => CREDIT.
        direction: signedAmountCents < 0 ? Direction.DEBIT : Direction.CREDIT,
        date: rawDate,
        description: rawDescription,
        reference_number: fields[indices.reference_number] || null,
      })
    }
  })

  const invalidCount = preview.filter(row => !row.is_valid).length
  const isValid = preview.length > 0 && invalidCount === 0

  return {
    is_valid: isValid,
    new_transactions_preview: preview,
    new_transactions_request: isValid ? { transactions } : null,
    invalid_transactions_count: invalidCount,
    total_transactions_count: preview.length,
  }
}

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
