import classNames from 'classnames'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { useCallback } from 'react'

type ExpandButtonProps = {
  isExpanded: boolean
  onClick: () => void
}

const baseClassName = 'Layer__ExpandButton'

export const ExpandButton = ({ isExpanded, onClick }: ExpandButtonProps) => {
  const className = classNames(baseClassName, `${baseClassName}--${isExpanded ? 'expanded' : 'collapsed'}`)
  const onToggleExpand = useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <ChevronDownFill
      role='button'
      className={className}
      size={16}
      aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
      onClick={onToggleExpand}
    />
  )
}
