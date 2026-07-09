import { FLAT_BASE_CHART_OF_ACCOUNTS } from '@fixtures/chartOfAccounts/constants'
import { FixtureIdPrefix } from '@fixtures/utils/arbitrary/id'

export const generator = () =>
  FLAT_BASE_CHART_OF_ACCOUNTS.map((account, index) => ({
    ...account,
    accountId: `${FixtureIdPrefix.chartOfAccount}-0000-4000-8000-${String(index).padStart(12, '0')}`,
    accountNumber: null,
  }))
