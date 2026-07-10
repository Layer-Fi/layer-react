import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { generateAccountsNeedingConfirmation } from '@fixtures/bankAccounts/generator'

const FIRST_LINK_ACCOUNT_COUNT = 3

// Advanced per generated account so each link session finds fresh banks;
// offset past the generated-fixture seed to avoid reproducing seeded ids.
let linkSessionSeed = 1000

/**
 * A fake Plaid link session "finds" randomly generated accounts needing
 * confirmation: a few on the first session, one more on each additional one.
 */
export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/plaid/link/exchange',
  resolve: () => {
    const count = bankAccountStore.all().length === 0 ? FIRST_LINK_ACCOUNT_COUNT : 1

    generateAccountsNeedingConfirmation(count, linkSessionSeed)
      .forEach(account => bankAccountStore.save(account))

    linkSessionSeed += count

    return apiData({})
  },
})
