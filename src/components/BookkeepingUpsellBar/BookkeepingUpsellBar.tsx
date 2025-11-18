import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { Link } from '@components/Button/Link'
import { Button, ButtonVariant } from '@components/Button/Button'
import CoffeeIcon from '@icons/Coffee'
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
  return (
    <div className='Layer__bar-banner Layer__bar-banner--bookkeeping'>
      <div className='Layer__bar-banner__left-col'>
        <IconBox>
          <CoffeeIcon />
        </IconBox>
        <div className='Layer__bar-banner__text-container'>
          <Text size={TextSize.md} weight={TextWeight.bold}>
            Need help with your books?
          </Text>
          <Text
            size={TextSize.sm}
            className='Layer__bar-banner__text-container__desc'
          >
            Order bookkeeping service supported by real humans.
          </Text>
        </div>
      </div>
      {onClick
        ? (
          <Button variant={ButtonVariant.secondary} onClick={onClick}>
            Schedule a demo
          </Button>
        )
        : href
          ? (
            <Link href={href} target='_blank' variant={ButtonVariant.secondary}>
              Schedule a demo
            </Link>
          )
          : null}
    </div>
  )
}
