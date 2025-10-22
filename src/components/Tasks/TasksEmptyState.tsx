import { Span } from '../ui/Typography/Text'
import { VStack } from '../ui/Stack/Stack'

export const TasksEmptyState = () => {
  return (
    <VStack gap='lg' pi='md' pbe='md'>
      <Span>Once you complete your bookkeeping onboarding call, you will see your bookkeeping tasks here.</Span>
    </VStack>
  )
}
