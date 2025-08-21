import type { LedgerEntrySource } from '../types/ledger_accounts'
import type { LedgerEntrySourceType } from '../hooks/useProfitAndLoss/useProfitAndLossDetailLines'

export type AnyLedgerEntrySource = LedgerEntrySource | LedgerEntrySourceType

/**
 * Type guard to check if a source is the new schema type (camelCase)
 */
export const isSchemaType = (source: AnyLedgerEntrySource): source is LedgerEntrySourceType => {
  return 'displayDescription' in source
}

/**
 * Type guard to check if a source is the legacy type (snake_case)
 */
export const isLegacyType = (source: AnyLedgerEntrySource): source is LedgerEntrySource => {
  return 'display_description' in source
}

/**
 * Convert from schema type (camelCase) to legacy type (snake_case)
 */
export const convertSchemaToLegacy = (source: LedgerEntrySourceType): LedgerEntrySource => {
  const baseFields = {
    type: source.type,
    display_description: source.displayDescription,
    entity_name: source.entityName,
  }

  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source':
      return {
        ...baseFields,
        transaction_id: source.transactionId,
        external_id: source.externalId,
        account_name: source.accountName,
        date: source.date,
        amount: source.amount,
        direction: source.direction,
        counterparty: source.counterparty,
        memo: source.memo,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    case 'Invoice_Ledger_Entry_Source':
      return {
        ...baseFields,
        invoice_id: source.invoiceId,
        external_id: source.externalId,
        invoice_number: source.invoiceNumber,
        customer_description: source.customerDescription,
        recipient_name: source.recipientName,
        date: source.date,
        amount: source.amount,
        entity_name: source.entityName,
        memo: source.memo,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    case 'Manual_Ledger_Entry_Source':
      return {
        ...baseFields,
        manual_entry_id: source.manualEntryId,
        memo: source.memo,
        created_by: source.createdBy,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    case 'Invoice_Payment_Ledger_Entry_Source':
      return {
        ...baseFields,
        external_id: source.externalId,
        invoice_id: source.invoiceId,
        invoice_number: source.invoiceNumber,
        amount: source.amount,
        memo: source.memo,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    case 'Refund_Ledger_Entry_Source':
      return {
        ...baseFields,
        external_id: source.externalId,
        refund_id: source.refundId,
        refunded_to_customer_amount: source.refundedToCustomerAmount,
        recipient_name: source.recipientName,
        memo: source.memo,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    case 'Refund_Payment_Ledger_Entry_Source':
      return {
        ...baseFields,
        external_id: source.externalId,
        refund_id: source.refundId,
        refund_payment_id: source.refundPaymentId,
        refunded_to_customer_amount: source.refundedToCustomerAmount,
        recipient_name: source.recipientName,
        memo: source.memo,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    case 'Opening_Balance_Ledger_Entry_Source':
      return {
        ...baseFields,
        account_name: source.accountName,
      } as LedgerEntrySource

    case 'Payout_Ledger_Entry_Source':
      return {
        ...baseFields,
        external_id: source.externalId,
        payout_id: source.payoutId,
        paid_out_amount: source.paidOutAmount,
        processor: source.processor,
        memo: source.memo,
        metadata: source.metadata,
        reference_number: source.referenceNumber,
      } as LedgerEntrySource

    default:
      // Handle any unknown types by returning base fields
      return baseFields as LedgerEntrySource
  }
}

/**
 * Convert from legacy type (snake_case) to schema type (camelCase)
 */
export const convertLegacyToSchema = (source: LedgerEntrySource): LedgerEntrySourceType => {
  const baseFields = {
    type: source.type,
    displayDescription: source.display_description,
    entityName: source.entity_name,
  }

  switch (source.type) {
    case 'Transaction_Ledger_Entry_Source':
      const txSource = source as any
      return {
        ...baseFields,
        transactionId: txSource.transaction_id,
        externalId: txSource.external_id,
        accountName: txSource.account_name,
        date: txSource.date,
        amount: txSource.amount,
        direction: txSource.direction,
        counterparty: txSource.counterparty,
        memo: txSource.memo,
        metadata: txSource.metadata,
        referenceNumber: txSource.reference_number,
      } as LedgerEntrySourceType

    case 'Invoice_Ledger_Entry_Source':
      const invSource = source as any
      return {
        ...baseFields,
        invoiceId: invSource.invoice_id,
        externalId: invSource.external_id,
        invoiceNumber: invSource.invoice_number,
        customerDescription: invSource.customer_description,
        recipientName: invSource.recipient_name,
        date: invSource.date,
        amount: invSource.amount,
        memo: invSource.memo,
        metadata: invSource.metadata,
        referenceNumber: invSource.reference_number,
      } as LedgerEntrySourceType

    case 'Manual_Ledger_Entry_Source':
      const manualSource = source as any
      return {
        ...baseFields,
        manualEntryId: manualSource.manual_entry_id,
        memo: manualSource.memo,
        createdBy: manualSource.created_by,
        metadata: manualSource.metadata,
        referenceNumber: manualSource.reference_number,
      } as LedgerEntrySourceType

    case 'Invoice_Payment_Ledger_Entry_Source':
      const invPaySource = source as any
      return {
        ...baseFields,
        externalId: invPaySource.external_id,
        invoiceId: invPaySource.invoice_id,
        invoiceNumber: invPaySource.invoice_number,
        amount: invPaySource.amount,
        memo: invPaySource.memo,
        metadata: invPaySource.metadata,
        referenceNumber: invPaySource.reference_number,
      } as LedgerEntrySourceType

    case 'Refund_Ledger_Entry_Source':
      const refundSource = source as any
      return {
        ...baseFields,
        externalId: refundSource.external_id,
        refundId: refundSource.refund_id,
        refundedToCustomerAmount: refundSource.refunded_to_customer_amount,
        recipientName: refundSource.recipient_name,
        memo: refundSource.memo,
        metadata: refundSource.metadata,
        referenceNumber: refundSource.reference_number,
      } as LedgerEntrySourceType

    case 'Refund_Payment_Ledger_Entry_Source':
      const refundPaySource = source as any
      return {
        ...baseFields,
        externalId: refundPaySource.external_id,
        refundId: refundPaySource.refund_id,
        refundPaymentId: refundPaySource.refund_payment_id,
        refundedToCustomerAmount: refundPaySource.refunded_to_customer_amount,
        recipientName: refundPaySource.recipient_name,
        memo: refundPaySource.memo,
        metadata: refundPaySource.metadata,
        referenceNumber: refundPaySource.reference_number,
      } as LedgerEntrySourceType

    case 'Opening_Balance_Ledger_Entry_Source':
      const obSource = source as any
      return {
        ...baseFields,
        accountName: obSource.account_name,
      } as LedgerEntrySourceType

    case 'Payout_Ledger_Entry_Source':
      const payoutSource = source as any
      return {
        ...baseFields,
        externalId: payoutSource.external_id,
        payoutId: payoutSource.payout_id,
        paidOutAmount: payoutSource.paid_out_amount,
        processor: payoutSource.processor,
        memo: payoutSource.memo,
        metadata: payoutSource.metadata,
        referenceNumber: payoutSource.reference_number,
      } as LedgerEntrySourceType

    default:
      // Handle any unknown types by returning base fields
      return baseFields as LedgerEntrySourceType
  }
}

/**
 * Normalize any ledger entry source to legacy format
 * This function can accept either format and always returns the legacy format
 */
export const normalizeLedgerSource = (source: AnyLedgerEntrySource): LedgerEntrySource => {
  return isSchemaType(source) ? convertSchemaToLegacy(source) : source
}

/**
 * Normalize any ledger entry source to schema format  
 * This function can accept either format and always returns the schema format
 */
export const normalizeToSchemaFormat = (source: AnyLedgerEntrySource): LedgerEntrySourceType => {
  return isLegacyType(source) ? convertLegacyToSchema(source) : source
}