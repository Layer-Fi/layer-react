import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import CollapseIcon from '@icons/Collapse'
import ExpandIcon from '@icons/Expand'
import { Button, ButtonVariant } from '@components/Button/Button'

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
  const { t } = useTranslation()
  return (
    <>
      <Button
        onClick={() => onClick(!expanded)}
        variant={
          variant
            ? variant
            : ButtonVariant.secondary
        }
        className={classNames(
          iconOnly
            ? 'Layer__expand-collapse-all-rows-btn--sm'
            : 'Layer__expand-collapse-all-rows-btn',
          className,
        )}
        rightIcon={
          !iconOnly ? null : expanded ? <CollapseIcon /> : <ExpandIcon />
        }
        iconAsPrimary={iconOnly}
        iconOnly={iconOnly}
      >
        {iconOnly ? null : !expanded ? t('reports.expandAllRows', 'Expand all rows') : t('reports.collapseAllRows', 'Collapse all rows')}
      </Button>
    </>
  )
}
