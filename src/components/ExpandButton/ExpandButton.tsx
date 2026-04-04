import classNames from 'classnames'
import type { MouseEventHandler } from 'react'

import ChevronDownFill from '@icons/ChevronDownFill'

import './expandButton.scss'

type ExpandButtonProps = {
  isExpanded: boolean
  onClick?: MouseEventHandler<SVGSVGElement>
}

const baseClassName = 'Layer__ExpandButton'

export const ExpandButton = ({ isExpanded, onClick }: ExpandButtonProps) => {
  const className = classNames(baseClassName, `${baseClassName}--${isExpanded ? 'expanded' : 'collapsed'}`)
  return (
    <ChevronDownFill
      role='button'
      className={className}
      size={16}
      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
      onClick={onClick}
    />
  )
}
