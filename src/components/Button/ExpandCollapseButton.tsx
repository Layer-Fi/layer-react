import CollapseIcon from '../../icons/Collapse'
import ExpandIcon from '../../icons/Expand'
import { Button, ButtonVariant } from './Button'
import classNames from 'classnames'

export interface ExpandCollapseButtonProps {
  onClick: (value: boolean) => void
  expanded?: boolean
  className?: string
  iconOnly?: boolean
  variant?: ButtonVariant
}

export const ExpandCollapseButton = ({
  onClick,
  expanded,
  className,
  iconOnly,
  variant,
}: ExpandCollapseButtonProps) => {
  return (
    <>
      <Button
        onClick={() => onClick(!expanded)}
        variant={
          variant
            ? variant
            : iconOnly
              ? ButtonVariant.secondary
              : ButtonVariant.tertiary
        }
        className={classNames(
          iconOnly
            ? 'Layer__expand-collpase-all-rows-btn--sm'
            : 'Layer__expand-collpase-all-rows-btn',
          className,
        )}
        rightIcon={
          !iconOnly ? null : expanded ? <CollapseIcon /> : <ExpandIcon />
        }
        iconAsPrimary={iconOnly}
        iconOnly={iconOnly}
      >
        {iconOnly ? null : !expanded ? 'Expand all rows' : 'Collapse all rows'}
      </Button>
    </>
  )
}
