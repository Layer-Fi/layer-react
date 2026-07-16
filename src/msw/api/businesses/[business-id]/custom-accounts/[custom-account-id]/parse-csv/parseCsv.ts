import { type PreviewCellEncoded } from '@schemas/csvUpload'
import { type RawCustomTransaction } from '@schemas/customAccounts'
import {
  type ParseCsvResponseSchema,
  type TransactionPreviewRowSchema,
} from '@hooks/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/useCustomAccountParseCsv'

type PreviewRowEncoded = typeof TransactionPreviewRowSchema.Encoded

export type ParseCsvResponseEncoded = typeof ParseCsvResponseSchema.Encoded

const REQUIRED_COLUMNS = ['date', 'description', 'amount'] as const

const splitCsvLine = (line: string) => line.split(',').map(field => field.trim().replace(/^"|"$/g, ''))

const cell = <T>(raw: string, parsed: T | null, isValid: boolean): PreviewCellEncoded<T> =>
  ({ raw, parsed, is_valid: isValid })

const optionalCell = (raw: string | undefined): PreviewCellEncoded<string> | null =>
  raw ? cell(raw, raw, true) : null

const INVALID_CSV_RESPONSE: ParseCsvResponseEncoded = {
  is_valid: false,
  new_transactions_preview: [],
  new_transactions_request: null,
  invalid_transactions_count: 0,
  total_transactions_count: 0,
}

export const parseCsv = (text: string): ParseCsvResponseEncoded => {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
  const [headerLine, ...rowLines] = lines

  if (!headerLine || rowLines.length === 0) return INVALID_CSV_RESPONSE

  const headers = splitCsvLine(headerLine).map(header => header.toLowerCase().replace(/\s+/g, '_'))

  if (REQUIRED_COLUMNS.some(column => !headers.includes(column))) return INVALID_CSV_RESPONSE

  const indices = {
    date: headers.indexOf('date'),
    description: headers.indexOf('description'),
    amount: headers.indexOf('amount'),
    external_id: headers.indexOf('external_id'),
    reference_number: headers.indexOf('reference_number'),
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
        direction: signedAmountCents < 0 ? 'DEBIT' : 'CREDIT',
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
