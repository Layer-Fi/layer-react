import { schema } from '@fixtures/bankAccounts/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generate = createGenerator(schema)

export const generator = () => generate({ numRuns: 5 })
