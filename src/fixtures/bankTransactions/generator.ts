import { schema } from '@fixtures/bankTransactions/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

const generate = createGenerator(schema)

export const generator = () => generate({ numRuns: 100 })
