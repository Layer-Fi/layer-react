import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

type CounterpartyAskSheetHeaderProps = {
  title: string
  onBack: () => void
  isBackDisabled?: boolean
}

export const CounterpartyAskSheetHeader = ({
  title,
  onBack,
  isBackDisabled,
}: CounterpartyAskSheetHeaderProps) => {
  const { t } = useTranslation()

  return (
    <HStack align='center' gap='xs'>
      <Button
        variant='outlined'
        icon
        isDisabled={isBackDisabled}
        onPress={onBack}
        aria-label={t('common:action.back', 'Back')}
      >
        <ChevronLeft size={17} />
      </Button>
      <Span size='md' weight='bold' ellipsis noWrap>{title}</Span>
    </HStack>
  )
}
