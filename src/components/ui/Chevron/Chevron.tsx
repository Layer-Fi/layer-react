import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import ChevronDownFill from '@icons/ChevronDownFill'
import { type IconSvgProps } from '@icons/types'

import './chevron.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__Chevron': 'Layer__chevron',
  'state:closed': ['Layer__chevron__down', 'Layer__Chevron--Down'],
  'state:open': ['Layer__chevron__up', 'Layer__Chevron--Up'],
})

type ChevronProps = IconSvgProps & {
  open?: boolean
}

export const Chevron = ({ open = false, className, ...props }: ChevronProps) => (
  <ChevronDownFill
    {...props}
    data-open={open || undefined}
    className={classNames(
      legacyClassNames('Layer__Chevron', open ? 'state:open' : 'state:closed'),
      className,
    )}
  />
)
