import { addDays, endOfMonth, formatISO, isValid, parseISO, startOfMonth } from 'date-fns'
import { Schema } from 'effect'

import { Direction } from '@internal-types/general'
import { PnlDetailLinesDataSchema } from '@schemas/reports/profitAndLoss'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID } from '@fixtures/profitAndLoss/constants'

type PnlDetailLinesData = typeof PnlDetailLinesDataSchema.Type
type PnlDetailLine = PnlDetailLinesData['lines'][number]

const encodeDetailLines = Schema.encodeSync(PnlDetailLinesDataSchema)

const toResponse = (data: PnlDetailLinesData) => apiData(encodeDetailLines(data))

const LINE_AMOUNTS = [184200, 96500, 152300, 68400, 120900, 45700]

const parseDateParam = (value: string | null, fallback: Date) => {
  const parsed = parseISO(value ?? '')
  return isValid(parsed) ? parsed : fallback
}

const makeLines = (lineItemName: string, startDate: Date): PnlDetailLine[] =>
  LINE_AMOUNTS.map((amount, index) => ({
    id: `pnl-detail-line-${index + 1}`,
    entryId: `ledger-entry-${index + 1}`,
    account: {
      id: `account-${lineItemName.toLowerCase()}`,
      name: lineItemName,
      stableName: lineItemName.toLowerCase(),
      normality: Direction.DEBIT,
      accountType: { value: 'EXPENSE', displayName: 'Expense' },
      accountSubtype: { value: 'OPERATING_EXPENSES', displayName: 'Operating Expenses' },
    },
    amount,
    direction: index % 5 === 4 ? Direction.CREDIT : Direction.DEBIT,
    date: addDays(startDate, index * 4 + 2).toISOString(),
  }))

export const get = createMockEndpoint<readonly PnlDetailLine[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/profit-and-loss/lines',
  resolve: ({ override, request }) => {
    const params = new URL(request.url).searchParams

    const startDate = parseDateParam(params.get('start_date'), startOfMonth(new Date()))
    const endDate = parseDateParam(params.get('end_date'), endOfMonth(startDate))
    const lineItemName = params.get('line_item_name') ?? 'EXPENSES'

    return toResponse({
      type: 'Profit_And_Loss_Detail_Lines',
      businessId: PROFIT_AND_LOSS_FIXTURE_BUSINESS_ID,
      startDate: formatISO(startDate, { representation: 'date' }),
      endDate: formatISO(endDate, { representation: 'date' }),
      pnlStructureLineItemName: lineItemName,
      reportingBasis: null,
      pnlStructure: null,
      tagFilter: null,
      lines: override ?? makeLines(lineItemName, startDate),
    })
  },
})
