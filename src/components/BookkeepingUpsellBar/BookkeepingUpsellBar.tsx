import { useTranslation } from 'react-i18next'

import CoffeeIcon from '@icons/Coffee'
import { Button, ButtonVariant } from '@components/Button/Button'
import { Link } from '@components/Button/Link'
import { IconBox } from '@components/IconBox/IconBox'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

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
          <CoffeeIcon />
        </IconBox>
        <div className='Layer__bar-banner__text-container'>
          <Text size={TextSize.md} weight={TextWeight.bold}>
            {t('needHelpWithYourBooks', 'Need help with your books?')}
          </Text>
          <Text
            size={TextSize.sm}
            className='Layer__bar-banner__text-container__desc'
          >
            {t('orderOurBookkeepingServiceSupportedByRealHumans', 'Order our bookkeeping service supported by real humans.')}
          </Text>
        </div>
      </div>
      {onClick
        ? (
          <Button variant={ButtonVariant.secondary} onClick={onClick}>
            {t('scheduleADemo', 'Schedule a demo')}
          </Button>
        )
        : href
          ? (
            <Link href={href} target='_blank' variant={ButtonVariant.secondary}>
              {t('scheduleADemo', 'Schedule a demo')}
            </Link>
          )
          : null}
    </div>
  )
}
