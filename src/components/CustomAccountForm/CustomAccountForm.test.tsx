import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  type CustomAccount,
  CustomAccountClassification,
  CustomAccountSubtype,
  CustomAccountType,
} from '@schemas/customAccounts'
import { CustomAccountForm, type CustomAccountsFormProps } from '@components/CustomAccountForm/CustomAccountForm'

import { post as postCustomAccount } from '@msw/api/businesses/[business-id]/custom-accounts/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { makeCustomAccount } from '@fixtures/customAccounts/mocks'
import { createFormFiller, type FillFormSpec } from '@test-utils/forms/fillForm'
import { LayerTestProvider, TEST_LAYER_BUSINESS_ID } from '@test-utils/LayerTestProvider'

const FORM_DATA = [
  { kind: 'text', field: 'Account name', value: 'Operating Account' },
  { kind: 'text', field: 'Institution name', value: 'Local Bank' },
  { kind: 'comboBox', field: 'Account type', option: 'Credit Card' },
] satisfies readonly FillFormSpec[]

const FORM_DATA_WITHOUT_ACCOUNT_NAME = [
  { kind: 'text', field: 'Institution name', value: 'Local Bank' },
  { kind: 'comboBox', field: 'Account type', option: 'Credit Card' },
] satisfies readonly FillFormSpec[]

const EXPECTED_CREDIT_CARD_CREATE_BODY = {
  account_name: 'Operating Account',
  institution_name: 'Local Bank',
  account_type: CustomAccountType.CREDIT,
  account_subtype: CustomAccountSubtype.CREDIT_CARD,
  custom_account_type: CustomAccountClassification.PERSONAL,
  external_id: null,
  mask: null,
  user_created: true,
}

const MOCK_CUSTOM_ACCOUNT = makeCustomAccount({
  accountName: 'Operating Account',
  institutionName: 'Local Bank',
  accountType: CustomAccountType.CREDIT,
  accountSubtype: CustomAccountSubtype.CREDIT_CARD,
})

const renderCustomAccountForm = (props: Partial<CustomAccountsFormProps> = {}) => {
  const user = userEvent.setup()

  return {
    user,
    filler: createFormFiller(user),
    ...render(
      <CustomAccountForm initialAccountName='' {...props} />,
      { wrapper: LayerTestProvider },
    ),
  }
}

const mockCreateAccount = (response: CustomAccount = makeCustomAccount()) => {
  const createAccountRequest = vi.fn()

  server.use(
    postCustomAccount.mock(response, {
      onRequest: async ({ request, params }) => {
        createAccountRequest({ body: await readRequestJson(request), businessId: params.businessId })
      },
    }),
  )

  return createAccountRequest
}

const mockCreateAccountError = () => {
  const createAccountRequest = vi.fn()

  server.use(
    postCustomAccount.mockError({ errors: [{ description: 'Unable to create account' }] }, {
      status: 500,
      onRequest: async ({ request, params }) => {
        createAccountRequest({ body: await readRequestJson(request), businessId: params.businessId })
      },
    }),
  )

  return createAccountRequest
}

describe('CustomAccountForm', () => {
  it('shows validation errors for required fields', async () => {
    const onSuccess = vi.fn()
    const createAccountRequest = mockCreateAccount()
    const { user } = renderCustomAccountForm({ onSuccess })

    await user.click(screen.getByRole('button', { name: /save account/i }))

    expect(await screen.findByText('Account name is required')).toBeInTheDocument()
    expect(screen.getByText('Institution name is required')).toBeInTheDocument()
    expect(screen.getByText('Account type is required')).toBeInTheDocument()
    expect(screen.getByText('Please check all fields.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save account/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()

    expect(createAccountRequest).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('shows an API error and does not call onSuccess when create fails', async () => {
    const onSuccess = vi.fn()
    const createAccountRequest = mockCreateAccountError()
    const { user, filler } = renderCustomAccountForm({ onSuccess })

    await filler.fill(FORM_DATA)
    await user.click(screen.getByRole('button', { name: /save account/i }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()

    expect(createAccountRequest).toHaveBeenCalledTimes(1)
    expect(createAccountRequest).toHaveBeenCalledWith({
      body: EXPECTED_CREDIT_CARD_CREATE_BODY,
      businessId: TEST_LAYER_BUSINESS_ID,
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('creates the account and calls onSuccess with the created account', async () => {
    const onSuccess = vi.fn()
    const createAccountRequest = mockCreateAccount(MOCK_CUSTOM_ACCOUNT)

    const { user, filler } = renderCustomAccountForm({ onSuccess })

    await filler.fill(FORM_DATA)

    await user.click(screen.getByRole('button', { name: /save account/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(MOCK_CUSTOM_ACCOUNT)
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(createAccountRequest).toHaveBeenCalledTimes(1)
    expect(createAccountRequest).toHaveBeenCalledWith({
      body: EXPECTED_CREDIT_CARD_CREATE_BODY,
      businessId: TEST_LAYER_BUSINESS_ID,
    })

    expect(screen.queryByText('Something went wrong. Please try again.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save account/i })).toBeInTheDocument()
  })

  it('defaults account type to personal and sends the selected account type', async () => {
    const onSuccess = vi.fn()
    const createAccountRequest = mockCreateAccount(MOCK_CUSTOM_ACCOUNT)
    const { user, filler } = renderCustomAccountForm({ onSuccess })

    expect(screen.getByRole('radio', { name: 'Personal' })).toBeChecked()

    await filler.fill(FORM_DATA)
    await filler.radio({ field: 'Account type', option: 'Business' })
    await user.click(screen.getByRole('button', { name: /save account/i }))

    await waitFor(() => {
      expect(createAccountRequest).toHaveBeenCalledWith({
        body: { ...EXPECTED_CREDIT_CARD_CREATE_BODY, custom_account_type: CustomAccountClassification.DEFAULT },
        businessId: TEST_LAYER_BUSINESS_ID,
      })
    })
  })

  it('uses initialAccountName as the starting account name', async () => {
    const onSuccess = vi.fn()

    const mockCustomAccountWithPrefilledName = {
      ...MOCK_CUSTOM_ACCOUNT,
      accountName: 'Prefilled Account',
    }

    const createAccountRequest = mockCreateAccount(mockCustomAccountWithPrefilledName)

    const { user, filler } = renderCustomAccountForm({
      initialAccountName: 'Prefilled Account',
      onSuccess,
    })

    expect(screen.getByRole('textbox', { name: 'Account name' })).toHaveValue('Prefilled Account')

    await filler.fill(FORM_DATA_WITHOUT_ACCOUNT_NAME)
    await user.click(screen.getByRole('button', { name: /save account/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockCustomAccountWithPrefilledName)
    })

    expect(createAccountRequest).toHaveBeenCalledWith({
      body: {
        ...EXPECTED_CREDIT_CARD_CREATE_BODY,
        account_name: 'Prefilled Account',
      },
      businessId: TEST_LAYER_BUSINESS_ID,
    })
  })
})
