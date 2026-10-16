import { connectAccountStep, fixtureId, makeUnifiedAskFormTask, page, seedsInFixtureYear, singlePageForm } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'

const CONNECT_ACCOUNT_QUESTION = 'Connect your Chase checking account so we can pull its transactions for you automatically.'

export const connectAccountTaskSeeds = seedsInFixtureYear({
  10: makeUnifiedAskFormTask({
    id: fixtureId('d11'),
    title: 'Connect checking account from Chase',
    question: CONNECT_ACCOUNT_QUESTION,
    form: singlePageForm(page('connect', [connectAccountStep('connect', CONNECT_ACCOUNT_QUESTION)])),
    discoveredAccount: { id: fixtureId('d12'), connectionMatchPending: false },
  }),
})
