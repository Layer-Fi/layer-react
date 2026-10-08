import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type AskFormPage } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askForm'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { type UnifiedAskFormApi } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskForm'
import { type UnifiedAskFormNavigation } from '@features/bookkeeping/UnifiedAskForm/useUnifiedAskFormNavigation'
import { getPagePrimaryAction } from '@features/bookkeeping/UnifiedAskForm/utils/routing'

type UnifiedAskFormPageFooterProps = {
  page: AskFormPage
  form: UnifiedAskFormApi
  navigation: UnifiedAskFormNavigation
  onContinue: () => void
}

export const UnifiedAskFormPageFooter = ({ page, form, navigation, onContinue }: UnifiedAskFormPageFooterProps) => {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { visitedPages, canGoBack, routing, getPageError } = navigation
  const isSubmitting = useStore(form.store, state => state.isSubmitting)
  const values = useStore(form.store, state => state.values)
  const canContinue = getPageError(page, values) === undefined

  const getPrimaryLabel = () => {
    if (routing === 'error') return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.action.try_again', 'Try again')

    switch (getPagePrimaryAction(page, values)) {
      case 'CONNECT_ACCOUNT':
        return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.action.connect_account', 'Connect account')
      case 'REVIEW':
        return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.action.review', 'Review')
      case 'SUBMIT':
        return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.action.submit', 'Submit')
      case 'NEXT':
        return t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.action.next', 'Next')
    }
  }

  return (
    <>
      {routing === 'error'
        ? (
          <HStack pi='md'>
            <Span size='sm' status='error'>
              {t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.error.load_next_question', 'We couldn’t load the next question. Try again.')}
            </Span>
          </HStack>
        )
        : null}
      <HStack justify='space-between' align='center' pi='md'>
        <Span size='xs' variant='subtle'>
          {canGoBack
            ? t('bookkeeping:UnifiedAskForm.UnifiedAskFormPageFooter.label.page_number', 'Page {{number}}', { number: formatNumber(visitedPages.length + 1) })
            : null}
        </Span>
        <Button isDisabled={!canContinue || isSubmitting} isPending={routing === 'loading' || isSubmitting} onPress={onContinue}>
          {getPrimaryLabel()}
        </Button>
      </HStack>
    </>
  )
}
