import { type ReactNode } from 'react'
import { useStore } from '@tanstack/react-form'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { VStack } from '@ui/Stack/Stack'
import { UnifiedAskFormPageFooter } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormPageFooter'
import { UnifiedAskFormPageSteps } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormPageSteps'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'
import { canAutoAdvance, type UnifiedAskFormPresentation } from '@features/bookkeeping/UnifiedAskForm/utils/routing'

type UnifiedAskFormPageProps = {
  task: UnifiedAskFormTask
  page: AskFormPage
  form: UnifiedAskFormApi
  navigation: UnifiedAskFormNavigation
  presentation: UnifiedAskFormPresentation
  footerAction?: ReactNode
}

export const UnifiedAskFormPage = ({ task, page, form, navigation, presentation, footerAction }: UnifiedAskFormPageProps) => {
  const { getPageError, continueFrom } = navigation
  const autoAdvances = canAutoAdvance(page, presentation)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  return (
    <form.FormGroup
      name={`pages.${page.id}`}
      validators={{ onDynamic: () => getPageError(page, form.state.values) }}
      onGroupSubmit={() => continueFrom(page)}
    >
      {group => (
        <VStack className='Layer__UnifiedAskForm__Page' gap='lg' pb='md'>
          <UnifiedAskFormPageSteps
            task={task}
            page={page}
            form={form}
            stepsById={navigation.stepsById}
            presentation={presentation}
            isDisabled={autoAdvances && (isSubmitting || navigation.routing === 'loading')}
            onAutoAdvance={autoAdvances ? () => void group.handleSubmit() : undefined}
          />
          <UnifiedAskFormPageFooter
            page={page}
            form={form}
            navigation={navigation}
            presentation={presentation}
            autoAdvances={autoAdvances}
            action={footerAction}
            onContinue={() => void group.handleSubmit()}
          />
        </VStack>
      )}
    </form.FormGroup>
  )
}
