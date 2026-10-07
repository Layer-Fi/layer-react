import { type AskForm } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type AskFormNext, AskFormNextKind } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormNext'
import {
  AskFormAction,
  AskFormCategoryScope,
  AskFormSearchEntity,
  AskFormStepType,
} from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

import { bankTransactionCategories } from '@fixtures/bankTransactions/constants'
import { mixOption } from '@fixtures/bookkeeping/unifiedAskFormTasks/counterparty'
import {
  ASK_FORM_STEP_IDS,
  askFormNextPageUrl,
  askTransactions,
  categoryOption,
  categoryStep,
  choiceOptions,
  choiceStep,
  fixtureId,
  makeUnifiedAskFormTask,
  page,
  seedsInFixtureYear,
  textFollowUp,
} from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

const VENDOR_CATEGORIES = [
  bankTransactionCategories.software,
  bankTransactionCategories.payrollContractors,
  bankTransactionCategories.officeExpenses,
  bankTransactionCategories.rent,
].map(categoryOption)

const serverNext = (taskId: string): AskFormNext => ({ kind: AskFormNextKind.Server, url: askFormNextPageUrl(taskId) })

export const makeAccountMaskAskForm = (taskId: string, mask: string): AskForm => ({
  entryPageId: ASK_FORM_STEP_IDS.accountType,
  pages: [
    page(ASK_FORM_STEP_IDS.accountType, [choiceStep(ASK_FORM_STEP_IDS.accountType, `What kind of account is ••${mask}?`, [
      ...choiceOptions({
        personal: 'A personal account',
        owned: 'Another account my business owns',
        vendor: 'A vendor I pay',
        customer: 'A customer who pays me',
      }),
      { value: 'unsure', label: 'Not sure', followUp: textFollowUp('Tell us anything you know about this account.') },
    ])], serverNext(taskId)),
    page('connect', [{
      id: 'connect',
      type: AskFormStepType.Action,
      action: AskFormAction.ConnectAccount,
      prompt: 'Connect this account so we can pull its transactions for you automatically.',
    }]),
    page('vendor', [
      {
        id: 'vendor',
        type: AskFormStepType.SearchWithFreeform,
        entity: AskFormSearchEntity.Vendor,
        prompt: 'Who is the vendor?',
        placeholder: 'Search your vendors or type a name',
        options: [],
      },
      categoryStep(ASK_FORM_STEP_IDS.vendorCategory, 'What do you buy from them?', [...VENDOR_CATEGORIES, mixOption('itemise')], { search: true }),
    ]),
    page('itemise', [categoryStep(ASK_FORM_STEP_IDS.rows, 'What was each of these payments for?', VENDOR_CATEGORIES, {
      scope: AskFormCategoryScope.EachTransaction,
      search: true,
    })]),
    page('customer', [choiceStep('paid_through', 'Did these payments come through your payments platform?', choiceOptions({
      platform: 'Yes, through the platform',
      direct: 'No, they paid me directly',
      not_sure: 'Not sure',
    }))]),
  ],
})

const ACCOUNT_MASK_TASK_ID = fixtureId('c21')

export const accountMaskTaskSeeds = seedsInFixtureYear({
  10: makeUnifiedAskFormTask({
    id: ACCOUNT_MASK_TASK_ID,
    title: 'Help us identify account ••2691',
    question: 'We found transfers to an account ending in 2691 that isn’t connected.',
    transactions: askTransactions(10, [
      { id: 'b21', day: 6, amount: -100000, description: 'ONLINE TRANSFER TO XXXXXX2691 REF #4810' },
      { id: 'b22', day: 13, amount: -100000, description: 'ONLINE TRANSFER TO XXXXXX2691 REF #4811' },
      { id: 'b23', day: 20, amount: -100000, description: 'ONLINE TRANSFER TO XXXXXX2691 REF #4812' },
    ]),
    form: makeAccountMaskAskForm(ACCOUNT_MASK_TASK_ID, '2691'),
  }),
})
