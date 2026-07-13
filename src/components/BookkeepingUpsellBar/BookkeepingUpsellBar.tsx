import { Coffee } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { LinkButton } from '@ui/Button/LinkButton'
import { P } from '@ui/Typography/Text'
import { IconBox } from '@components/IconBox/IconBox'

import './bookkeepingUpsellBar.scss'

interface BookkeepingUpsellBarProps {
  onClick?: () => void
  href?: string
}

export const BookkeepingUpsellBar = ({
  onClick,
  href,
}: BookkeepingUpsellBarProps) => {
  const { t } = useTranslation()
  return (
    <div className='Layer__bar-banner Layer__bar-banner--bookkeeping'>
      <div className='Layer__bar-banner__left-col'>
        <IconBox>
          <Coffee size={11} />
        </IconBox>
        <div className='Layer__bar-banner__text-container'>
          <P weight='bold' variant='inherit'>
            {t('bookkeeping:prompt.need_help_books', 'Need help with your books?')}
          </P>
          <P size='sm' variant='white'>
            {t('bookkeeping:label.order_our_bookkeeping_service', 'Order our bookkeeping service supported by real humans.')}
          </P>
        </div>
      </div>
      {onClick
        ? (
          <Button variant='outlined' onPress={onClick}>
            {t('bookkeeping:action.schedule_a_demo', 'Schedule a demo')}
          </Button>
        )
        : href
          ? (
            <LinkButton href={href} external variant='outlined'>
              {t('bookkeeping:action.schedule_a_demo', 'Schedule a demo')}
            </LinkButton>
          )
          : null}
    </div>
  )
}
