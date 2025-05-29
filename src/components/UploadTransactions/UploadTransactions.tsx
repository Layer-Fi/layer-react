import { UploadTransactionsUploadCsvStep } from './UploadTransactionsUploadCsvStep'
import { Wizard } from '../Wizard/Wizard'
import { Heading } from '../ui/Typography/Heading'
import type { Awaitable } from '../../types/utility/promises'
import { VStack } from '../ui/Stack/Stack'
import { P } from '../ui/Typography/Text'

type UploadTransactionsProps = {
  onComplete?: () => Awaitable<void>
}

export function UploadTransactions({ onComplete }: UploadTransactionsProps) {
  return (
    <section className='Layer__component'>
      <Wizard
        Header={(
          <VStack gap='xs'>
            <Heading>
              Upload bank transactions
            </Heading>
            <P pbe='xl' size='sm' variant='subtle'>
              Add file downloaded from your bank account
            </P>
          </VStack>
        )}
        Footer={null}
        onComplete={onComplete}
      >
        <UploadTransactionsUploadCsvStep />
      </Wizard>
    </section>
  )
}
