import { type ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { BankTransactionDirection, TransactionSource } from '@schemas/bankTransactions/base'
import { type BankTransactionCategorization, BankTransactionSelectionVariant } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { BankTransactionsCategorizationStoreProvider } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { convertApiCategorizationToCategoryOrSplitAsOption } from '@components/BankTransactionCategoryComboBox/utils'
import { RecordTransactionModal } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionModal'
import { type RecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/useRecordTransactionForm'

import { get as getAccountingConfig } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { patch as patchRecordTransaction } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/[transaction-id]/record/patch'
import { post as postRecordTransaction } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'
import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'
import { get as getCustomers } from '@msw/api/businesses/[business-id]/customers/get'
import { get as getVendors } from '@msw/api/businesses/[business-id]/vendors/get'
import { post as postVendor } from '@msw/api/businesses/[business-id]/vendors/post'
import { server } from '@msw/node'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { makeBankTransaction } from '@fixtures/bankTransactions/mocks'
import { makeCustomAccount } from '@fixtures/customAccounts/mocks'
import { makeCustomer } from '@fixtures/customers/mocks'
import { makeVendor } from '@fixtures/vendors/mocks'
import { createFormFiller, type FillFormSpec } from '@test-utils/forms/fillForm'
import { LayerTestProvider } from '@test-utils/LayerTestProvider'

const RecordModalWrapper = ({ children }: { children: ReactNode }) => (
  <LayerTestProvider>
    <BankTransactionsCategorizationStoreProvider>{children}</BankTransactionsCategorizationStoreProvider>
  </LayerTestProvider>
)

const CUSTOM_ACCOUNT = makeCustomAccount({ accountName: 'Business Checking' })
const VENDOR = makeVendor({ individualName: 'John Smith' })
const CUSTOMER = makeCustomer({ individualName: 'Jane Doe' })

const EXPENSE_FORM_DATA = [
  { kind: 'comboBox', field: 'Paid to', option: /Business Checking/ },
  { kind: 'comboBox', field: 'Vendor', option: /John Smith/ },
  { kind: 'number', field: 'Amount', value: '125.50' },
  { kind: 'comboBox', field: 'Category', option: /^Cash$/ },
  { kind: 'text', field: 'Memo', value: 'Team lunch' },
] satisfies readonly FillFormSpec[]

const INCOME_FORM_DATA = [
  { kind: 'comboBox', field: 'Deposited in', option: /Business Checking/ },
  { kind: 'comboBox', field: 'Customer', option: /Jane Doe/ },
  { kind: 'number', field: 'Amount', value: '80' },
  { kind: 'comboBox', field: 'Category', option: /^Cash$/ },
  { kind: 'text', field: 'Memo', value: 'Cash sale' },
] satisfies readonly FillFormSpec[]

const renderModal = (variant: RecordTransactionVariant = 'expense', { enableManagement = false }: { enableManagement?: boolean } = {}) => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()

  server.use(
    getCustomAccounts.mock([CUSTOM_ACCOUNT]),
    getVendors.mock([VENDOR]),
    getCustomers.mock([CUSTOMER]),
  )

  if (enableManagement) {
    server.use(getAccountingConfig.mock(makeAccountingConfiguration({ enableCustomerManagement: true, enableVendorManagement: true })))
  }

  return {
    user,
    onOpenChange,
    filler: createFormFiller(user),
    ...render(
      <RecordTransactionModal variant={variant} isOpen onOpenChange={onOpenChange} />,
      { wrapper: RecordModalWrapper },
    ),
  }
}

const EDIT_TRANSACTION = makeBankTransaction({
  source: TransactionSource.CUSTOM,
  externalAccountId: CUSTOM_ACCOUNT.id,
  sourceTransactionId: 'ext-txn-1',
  accountName: CUSTOM_ACCOUNT.accountName,
  direction: BankTransactionDirection.Debit,
  amount: 12550,
  memo: 'Team lunch',
  counterpartyName: 'John Smith',
  vendor: VENDOR,
  customer: null,
  category: { type: 'Account', id: 'cash', stableName: 'cash', category: 'cash', displayName: 'Cash', description: null },
  categorizationStatus: CategorizationStatus.CATEGORIZED,
})

const EDIT_CATEGORIZATION: BankTransactionCategorization = {
  category: convertApiCategorizationToCategoryOrSplitAsOption(EDIT_TRANSACTION.category!),
  taxCode: 'TAX-1',
  match: null,
  variant: BankTransactionSelectionVariant.CATEGORY,
}

const renderEditModal = () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()

  server.use(
    getCustomAccounts.mock([CUSTOM_ACCOUNT]),
    getVendors.mock([VENDOR]),
    getCustomers.mock([CUSTOMER]),
  )

  return {
    user,
    onOpenChange,
    ...render(
      <RecordTransactionModal variant='expense' transaction={EDIT_TRANSACTION} categorization={EDIT_CATEGORIZATION} isOpen onOpenChange={onOpenChange} />,
      { wrapper: RecordModalWrapper },
    ),
  }
}

const mockUpdateTransaction = () => {
  const updateRequest = vi.fn()

  server.use(
    patchRecordTransaction.mock(makeBankTransaction(), {
      onRequest: async ({ request, params }) => {
        const formData = await request.formData()
        updateRequest({
          customAccountId: params.customAccountId,
          transactionId: params.transactionId,
          transaction: JSON.parse(formData.get('transaction') as string) as unknown,
        })
      },
    }),
  )

  return updateRequest
}

const createCounterparty = async (user: ReturnType<typeof userEvent.setup>, label: string, typed: string, createOption: string) => {
  // react-select swaps the input node when the option list finishes loading, so re-query each poll.
  await waitFor(() => expect(screen.getByLabelText(label)).toBeEnabled())
  const input = screen.getByLabelText(label)
  await user.click(input)
  await user.type(input, typed)
  await user.click(await screen.findByRole('option', { name: createOption }))
}

const mockRecordTransaction = () => {
  const recordRequest = vi.fn()

  server.use(
    postRecordTransaction.mock(makeBankTransaction(), {
      onRequest: async ({ request, params }) => {
        const formData = await request.formData()
        recordRequest({
          customAccountId: params.customAccountId,
          transaction: JSON.parse(formData.get('transaction') as string) as unknown,
        })
      },
    }),
  )

  return recordRequest
}

const mockRecordTransactionError = () => {
  const recordRequest = vi.fn()

  server.use(
    postRecordTransaction.mockError({ errors: [{ description: 'Unable to record transaction' }] }, {
      status: 500,
      onRequest: () => { recordRequest() },
    }),
  )

  return recordRequest
}

describe('RecordTransactionModal', () => {
  it('shows validation errors for required fields', async () => {
    const recordRequest = mockRecordTransaction()
    const { user, onOpenChange } = renderModal()

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText('Account is required')).toBeInTheDocument()
    expect(screen.getByText('Vendor is required')).toBeInTheDocument()
    expect(screen.getByText('Amount must be greater than zero')).toBeInTheDocument()
    expect(screen.getByText('Category is required')).toBeInTheDocument()

    expect(recordRequest).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('records an expense and closes the modal', async () => {
    const recordRequest = mockRecordTransaction()
    const { user, filler, onOpenChange } = renderModal('expense')

    await filler.fill(EXPENSE_FORM_DATA)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(recordRequest).toHaveBeenCalledTimes(1))

    expect(recordRequest).toHaveBeenCalledWith({
      customAccountId: CUSTOM_ACCOUNT.id,
      transaction: {
        external_id: expect.any(String) as string,
        amount: 12550,
        direction: 'DEBIT',
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) as string,
        description: '',
        memo: 'Team lunch',
        vendor_id: VENDOR.id,
        categorization: {
          type: 'Category',
          category: expect.objectContaining({ type: expect.any(String) as string }) as object,
          tax_code: null,
        },
      },
    })

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('records income with a credit direction and the selected customer', async () => {
    const recordRequest = mockRecordTransaction()
    const { user, filler, onOpenChange } = renderModal('income')

    await filler.fill(INCOME_FORM_DATA)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(recordRequest).toHaveBeenCalledTimes(1))

    expect(recordRequest).toHaveBeenCalledWith(expect.objectContaining({
      transaction: expect.objectContaining({
        amount: 8000,
        direction: 'CREDIT',
        description: '',
        memo: 'Cash sale',
        customer_id: CUSTOMER.id,
      }) as object,
    }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('pre-populates fields and updates via the record PATCH when editing', async () => {
    const updateRequest = mockUpdateTransaction()
    const { user, onOpenChange } = renderEditModal()

    expect(await screen.findByText('Edit transaction')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Team lunch')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(updateRequest).toHaveBeenCalledTimes(1))

    expect(updateRequest).toHaveBeenCalledWith(expect.objectContaining({
      customAccountId: CUSTOM_ACCOUNT.id,
      transactionId: EDIT_TRANSACTION.id,
      transaction: expect.objectContaining({
        amount: 12550,
        direction: 'DEBIT',
        memo: 'Team lunch',
        vendor_id: VENDOR.id,
        categorization: expect.objectContaining({
          type: 'Category',
          tax_code: 'TAX-1',
        }) as object,
      }) as object,
    }))

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('shows a retry state and keeps the modal open when the request fails', async () => {
    const recordRequest = mockRecordTransactionError()
    const { user, filler, onOpenChange } = renderModal('expense')

    await filler.fill(EXPENSE_FORM_DATA)
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument()

    expect(recordRequest).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('creates a vendor from the typed company name and records it against the new vendor', async () => {
    const NEW_VENDOR = makeVendor({ id: '00000000-0000-4000-8000-0000000000aa', individualName: null, companyName: 'Acme Supplies' })
    const recordRequest = mockRecordTransaction()

    let createdVendorBody: unknown
    server.use(postVendor.mock(NEW_VENDOR, {
      onRequest: async ({ request }) => { createdVendorBody = await request.json() },
    }))

    const { user, filler } = renderModal('expense', { enableManagement: true })

    await createCounterparty(user, 'Vendor', 'Acme Supplies', 'Create "Acme Supplies"')

    expect(await screen.findByText('Acme Supplies')).toBeInTheDocument()
    expect(createdVendorBody).toEqual({ company_name: 'Acme Supplies' })

    await filler.fill([
      { kind: 'comboBox', field: 'Paid to', option: /Business Checking/ },
      { kind: 'number', field: 'Amount', value: '40' },
      { kind: 'comboBox', field: 'Category', option: /^Cash$/ },
    ])
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(recordRequest).toHaveBeenCalledTimes(1))
    expect(recordRequest).toHaveBeenCalledWith(expect.objectContaining({
      transaction: expect.objectContaining({ vendor_id: NEW_VENDOR.id }) as object,
    }))
  })
})
