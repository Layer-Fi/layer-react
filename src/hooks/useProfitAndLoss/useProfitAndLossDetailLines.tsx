import useSWR, { type SWRResponse } from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useGlobalInvalidator } from '../../utils/swr/useGlobalInvalidator'
import { useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { get } from '../../api/layer/authenticated_http'
import { Schema, pipe } from 'effect'
import { ReportingBasis, Direction } from '../../types'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'

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

type PnlDetailLinesParams = PnlDetailLinesBaseParams & PnlDetailLinesFilterParams

const TransactionLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Transaction_Ledger_Entry_Source'),
  transactionId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('transaction_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  accountName: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('account_name'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  counterparty: Schema.optional(Schema.String),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const InvoiceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Ledger_Entry_Source'),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('recipient_name'),
  ),
  customerDescription: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('customer_description'),
  ),
  date: Schema.String,
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const ManualLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Manual_Ledger_Entry_Source'),
  manualEntryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('manual_entry_id'),
  ),
  memo: Schema.NullOr(Schema.String),
  createdBy: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_by'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const InvoicePaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Invoice_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  invoiceId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('invoice_id'),
  ),
  invoiceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('invoice_number'),
  ),
  amount: Schema.Number,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const RefundLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  refundedToCustomerAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('refunded_to_customer_amount'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('recipient_name'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const RefundPaymentLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Refund_Payment_Ledger_Entry_Source'),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  refundId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_id'),
  ),
  refundPaymentId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('refund_payment_id'),
  ),
  refundedToCustomerAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('refunded_to_customer_amount'),
  ),
  recipientName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('recipient_name'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const OpeningBalanceLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Opening_Balance_Ledger_Entry_Source'),
  accountName: pipe(
    Schema.optional(Schema.String),
    Schema.fromKey('account_name'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

const PayoutLedgerEntrySourceSchema = Schema.Struct({
  displayDescription: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_description'),
  ),
  entityName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entity_name'),
  ),
  type: Schema.Literal('Payout_Ledger_Entry_Source'),
  payoutId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('payout_id'),
  ),
  externalId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('external_id'),
  ),
  paidOutAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('paid_out_amount'),
  ),
  processor: Schema.String,
  completedAt: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('completed_at'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const LedgerEntrySourceSchema = Schema.Union(
  TransactionLedgerEntrySourceSchema,
  InvoiceLedgerEntrySourceSchema,
  ManualLedgerEntrySourceSchema,
  InvoicePaymentLedgerEntrySourceSchema,
  RefundLedgerEntrySourceSchema,
  RefundPaymentLedgerEntrySourceSchema,
  OpeningBalanceLedgerEntrySourceSchema,
  PayoutLedgerEntrySourceSchema,
)

const AccountTypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

const AccountSubtypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('stable_name'),
  ),
  normality: Schema.String,
  accountType: pipe(
    Schema.propertySignature(AccountTypeSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(AccountSubtypeSchema),
    Schema.fromKey('account_subtype'),
  ),
})

const TagFilterSchema = Schema.Struct({
  key: Schema.String,
  values: Schema.Array(Schema.String),
})

export const PnlDetailLineSchema = Schema.Struct({
  id: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: AccountSchema,
  amount: Schema.Number,
  direction: Schema.Enums(Direction),
  date: Schema.String,
  source: Schema.optional(LedgerEntrySourceSchema),
})

const PnlDetailLinesDataSchema = Schema.Struct({
  type: Schema.String,
  businessId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('business_id'),
  ),
  startDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('start_date'),
  ),
  endDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('end_date'),
  ),
  pnlStructureLineItemName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('pnl_structure_line_item_name'),
  ),
  reportingBasis: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reporting_basis'),
  ),
  pnlStructure: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('pnl_structure'),
  ),
  tagFilter: pipe(
    Schema.propertySignature(Schema.NullOr(TagFilterSchema)),
    Schema.fromKey('tag_filter'),
  ),
  lines: Schema.Array(PnlDetailLineSchema),
})

export type PnlDetailLinesReturn = typeof PnlDetailLinesDataSchema.Type

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
}: PnlDetailLinesBaseParams & PnlDetailLinesFilterParams) {
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
    }) => getProfitAndLossDetailLines(
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
    )().then(response => response.data).then(Schema.decodeUnknownPromise(PnlDetailLinesDataSchema)),
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

type GetProfitAndLossDetailLinesParams = {
  businessId: string
  startDate: Date
  endDate: Date
  pnlStructureLineItemName: string
  tagKey?: string
  tagValues?: string
  reportingBasis?: string
  pnlStructure?: string
}

export const getProfitAndLossDetailLines = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossDetailLinesParams) => {
  const { businessId, startDate, endDate, pnlStructureLineItemName, tagKey, tagValues, reportingBasis, pnlStructure } = params
  const queryParams = toDefinedSearchParameters({
    startDate,
    endDate,
    lineItemName: pnlStructureLineItemName,
    reportingBasis,
    tagKey,
    tagValues,
    pnlStructure,
  })

  return get<{
    data?: PnlDetailLinesReturn
    params: GetProfitAndLossDetailLinesParams
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/lines?${queryParams.toString()}`,
  )(apiUrl, accessToken, { params: { businessId } })
}
