import useSWR, { type SWRResponse } from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { Layer } from '../../api/layer'
import { useGlobalInvalidator } from '../../utils/swr/useGlobalInvalidator'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { Schema } from 'effect'
import { ReportingBasis, Direction } from '../../types'

export const LIST_PNL_DETAIL_LINES_TAG_KEY = '#list-pnl-detail-lines'

type PnlStructureLineItemName = string

type PnlDetailLinesBaseParams = {
  businessId: string
  startDate: Date
  endDate: Date
  pnlStructureLineItemName: PnlStructureLineItemName
}

type PnlDetailLinesFilterParams = {
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
  pnlStructure?: string
}

type PnlDetailLinesOptions = PnlDetailLinesFilterParams

type PnlDetailLinesParams = PnlDetailLinesBaseParams & PnlDetailLinesOptions

const TransactionLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Transaction_Ledger_Entry_Source'),
  transaction_id: Schema.String,
  external_id: Schema.String,
  account_name: Schema.optional(Schema.String),
  date: Schema.String,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  counterparty: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const InvoiceLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Invoice_Ledger_Entry_Source'),
  invoice_id: Schema.String,
  external_id: Schema.String,
  invoice_number: Schema.NullOr(Schema.String),
  recipient_name: Schema.String,
  customer_description: Schema.optional(Schema.String),
  date: Schema.String,
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const ManualLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Manual_Ledger_Entry_Source'),
  manual_entry_id: Schema.String,
  memo: Schema.NullOr(Schema.String),
  created_by: Schema.String,
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const InvoicePaymentLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Invoice_Payment_Ledger_Entry_Source'),
  external_id: Schema.String,
  invoice_id: Schema.String,
  invoice_number: Schema.NullOr(Schema.String),
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const RefundLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Refund_Ledger_Entry_Source'),
  external_id: Schema.String,
  refund_id: Schema.String,
  refunded_to_customer_amount: Schema.Number,
  recipient_name: Schema.String,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const RefundPaymentLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Refund_Payment_Ledger_Entry_Source'),
  external_id: Schema.String,
  refund_id: Schema.String,
  refund_payment_id: Schema.String,
  refunded_to_customer_amount: Schema.Number,
  recipient_name: Schema.String,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const OpeningBalanceLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Opening_Balance_Ledger_Entry_Source'),
  account_name: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const PayoutLedgerEntrySourceSchema = Schema.Struct({
  display_description: Schema.String,
  entity_name: Schema.String,
  type: Schema.Literal('Payout_Ledger_Entry_Source'),
  payout_id: Schema.String,
  external_id: Schema.String,
  paid_out_amount: Schema.Number,
  processor: Schema.String,
  completed_at: Schema.String,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  reference_number: Schema.optional(Schema.NullOr(Schema.String)),
})

const LedgerEntrySourceSchema = Schema.Union(
  TransactionLedgerEntrySourceSchema,
  InvoiceLedgerEntrySourceSchema,
  ManualLedgerEntrySourceSchema,
  InvoicePaymentLedgerEntrySourceSchema,
  RefundLedgerEntrySourceSchema,
  RefundPaymentLedgerEntrySourceSchema,
  OpeningBalanceLedgerEntrySourceSchema,
  PayoutLedgerEntrySourceSchema,
)

const AccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stable_name: Schema.String,
  normality: Schema.String,
  account_type: Schema.Struct({
    value: Schema.String,
    display_name: Schema.String,
  }),
  account_subtype: Schema.Struct({
    value: Schema.String,
    display_name: Schema.String,
  }),
})

const PnlDetailLinesDataSchema = Schema.Struct({
  type: Schema.String,
  business_id: Schema.String,
  start_date: Schema.String,
  end_date: Schema.String,
  pnl_structure_line_item_name: Schema.String,
  reporting_basis: Schema.optional(Schema.NullOr(Schema.String)),
  pnl_structure: Schema.optional(Schema.NullOr(Schema.String)),
  tag_filter: Schema.NullOr(Schema.Struct({
    key: Schema.String,
    values: Schema.Array(Schema.String),
  })),
  lines: Schema.Array(Schema.Struct({
    id: Schema.String,
    entry_id: Schema.String,
    account: AccountSchema,
    amount: Schema.Number,
    direction: Schema.Enums(Direction),
    date: Schema.String,
    source: Schema.optional(LedgerEntrySourceSchema),
  })),
})

const PnlDetailLinesReturnSchema = PnlDetailLinesDataSchema

type PnlDetailLinesReturn = typeof PnlDetailLinesReturnSchema.Type

class PnlDetailLinesSWRResponse {
  private swrResponse: SWRResponse<PnlDetailLinesReturn>

  constructor(swrResponse: SWRResponse<PnlDetailLinesReturn>) {
    this.swrResponse = swrResponse
  }

  get data(): PnlDetailLinesReturn | undefined {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }

  get error() {
    return this.swrResponse.error
  }

  get refetch() {
    return this.swrResponse.mutate
  }
}

function keyLoader(
  {
    access_token: accessToken,
    apiUrl,
    businessId,
    startDate,
    endDate,
    pnlStructureLineItemName,
    tagFilter,
    reportingBasis,
    pnlStructure,
  }: {
    access_token?: string
    apiUrl?: string
  } & PnlDetailLinesParams,
) {
  if (accessToken && apiUrl && businessId && startDate && endDate && pnlStructureLineItemName) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
      tags: [LIST_PNL_DETAIL_LINES_TAG_KEY],
    } as const
  }
  return null
}

export function useProfitAndLossDetailLines({
  startDate,
  endDate,
  pnlStructureLineItemName,
  tagFilter,
  reportingBasis,
  pnlStructure,
}: PnlDetailLinesBaseParams & PnlDetailLinesOptions) {
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const swrResponse = useSWR(
    () => keyLoader({
      ...auth,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
    }),
    ({
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      pnlStructureLineItemName,
      tagFilter,
      reportingBasis,
      pnlStructure,
    }) => Layer.getProfitAndLossDetailLines(
      apiUrl,
      accessToken,
      {
        businessId,
        startDate,
        endDate,
        pnlStructureLineItemName,
        tagKey: tagFilter?.key,
        tagValues: tagFilter?.values?.join(','),
        reportingBasis,
        pnlStructure,
      },
    )().then(response => response.data).then(Schema.decodeUnknownPromise(PnlDetailLinesReturnSchema)),
    {
      keepPreviousData: true,
    },
  )

  return new PnlDetailLinesSWRResponse(swrResponse)
}

const INVALIDATION_DEBOUNCE_OPTIONS = {
  wait: 1000,
  maxWait: 3000,
}

export function usePnlDetailLinesInvalidator() {
  const { invalidate } = useGlobalInvalidator()

  const invalidatePnlDetailLines = useCallback(
    () => invalidate(tags => tags.includes(LIST_PNL_DETAIL_LINES_TAG_KEY)),
    [invalidate],
  )

  const debouncedInvalidatePnlDetailLines = useMemo(
    () => debounce(
      invalidatePnlDetailLines,
      INVALIDATION_DEBOUNCE_OPTIONS.wait,
      {
        maxWait: INVALIDATION_DEBOUNCE_OPTIONS.maxWait,
        trailing: true,
      },
    ),
    [invalidatePnlDetailLines],
  )

  return {
    invalidatePnlDetailLines,
    debouncedInvalidatePnlDetailLines,
  }
}
