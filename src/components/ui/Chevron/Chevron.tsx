import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import ChevronDownFill from '@icons/ChevronDownFill'
import { type IconSvgProps } from '@icons/types'

import './chevron.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__Chevron': 'Layer__chevron',
  'Layer__Chevron--Down': 'Layer__chevron__down',
  'Layer__Chevron--Up': 'Layer__chevron__up',
})

type ChevronProps = IconSvgProps & {
  open?: boolean
}

export const Chevron = ({ open = false, className, ...props }: ChevronProps) => (
  <ChevronDownFill
    {...props}
    className={classNames(
      legacyClassNames(
        'Layer__Chevron',
        open ? 'Layer__Chevron--Up' : 'Layer__Chevron--Down',
      ),
      className,
    )}
  />
)
