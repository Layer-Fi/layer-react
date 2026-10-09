import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { AskFormResolutionKind, type UnifiedAskFormTask } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { SlidingPanes } from '@components/utility/SlidingPanes/SlidingPanes'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { UnifiedAskFormPage } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormPage'
import { UnifiedAskFormReview } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormReview'
import { UnifiedAskFormTransactions } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactions'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'
import { type UnifiedAskFormPresentation } from '@features/bookkeeping/UnifiedAskForm/utils/routing'
import { isSheetStep } from '@features/bookkeeping/UnifiedAskForm/utils/steps'

import './unifiedAskForm.scss'

export type UnifiedAskFormSlots = {
  /** Rendered beside the page's primary action, such as the takeover's Skip. */
  FooterAction?: ReactNode
}

type UnifiedAskFormProps = {
  task: UnifiedAskFormTask
  form: UnifiedAskFormApi
  navigation: UnifiedAskFormNavigation
  isExpanded: boolean
  presentation?: UnifiedAskFormPresentation
  slots?: UnifiedAskFormSlots
}

export const UnifiedAskForm = ({ task, form, navigation, isExpanded, presentation = 'inline', slots }: UnifiedAskFormProps) => {
  const { t } = useTranslation()
  const { view, direction, currentPage } = navigation

  if (task.resolution?.kind === AskFormResolutionKind.ResolvedByTask) {
    return (
      <VStack pb='md' pi='md'>
        <P size='sm' variant='subtle'>
          {t(
            'bookkeeping:UnifiedAskForm.label.answered_elsewhere_detail',
            'You answered this for every period, so we’ve applied it here too.',
          )}
        </P>
      </VStack>
    )
  }

  const showsTransactions = task.transactions.length > 0 && !currentPage?.steps.some(isSheetStep)
  const paneKey = view.kind === 'PAGE' ? `page:${view.pageId}` : view.kind

  return (
    <VStack gap='md' className='Layer__UnifiedAskForm' {...toDataProperties({ presentation })}>
      {showsTransactions ? <UnifiedAskFormTransactions transactions={task.transactions} /> : null}
      <SlidingPanes paneKey={paneKey} direction={direction} keepInView={isExpanded}>
        {view.kind === 'REVIEW'
          ? <UnifiedAskFormReview form={form} navigation={navigation} />
          : currentPage && (
            <UnifiedAskFormPage
              task={task}
              page={currentPage}
              form={form}
              navigation={navigation}
              presentation={presentation}
              footerAction={slots?.FooterAction}
            />
          )}
      </SlidingPanes>
    </VStack>
  )
}
