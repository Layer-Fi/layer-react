import classNames from 'classnames'

import ChevronDownFill from '@icons/ChevronDownFill'
import { type IconSvgProps } from '@icons/types'

import './chevron.scss'

type ChevronProps = IconSvgProps & {
  open?: boolean
}

export const Chevron = ({ open = false, className, ...props }: ChevronProps) => (
  <ChevronDownFill
    {...props}
    className={classNames(
      'Layer__Chevron',
      open ? 'Layer__Chevron--Up' : 'Layer__Chevron--Down',
      className,
    )}
  />
)
