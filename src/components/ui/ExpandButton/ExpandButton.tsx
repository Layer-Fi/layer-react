import classNames from 'classnames'

import ChevronDownFill from '@icons/ChevronDownFill'

import './expandButton.scss'

type ExpandButtonProps = {
  isExpanded: boolean
}

const baseClassName = 'Layer__ExpandButton'

export const ExpandButton = ({ isExpanded }: ExpandButtonProps) => {
  const className = classNames(baseClassName, `${baseClassName}--${isExpanded ? 'expanded' : 'collapsed'}`)
  return (
    <ChevronDownFill
      className={className}
      size={16}
      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
    />
  )
}
