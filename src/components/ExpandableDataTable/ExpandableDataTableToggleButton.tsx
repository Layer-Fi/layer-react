import { useCallback, useContext } from 'react'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'

type ExpandableDataTableToggleButtonProps = {
  icon?: boolean
}

export const ExpandableDataTableToggleButton = ({ icon }: ExpandableDataTableToggleButtonProps) => {
  const { t } = useTranslation()
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)
  const { isDesktop } = useSizeClass()
  const resolvedIcon = icon ?? !isDesktop

  const shouldCollapse = expanded === true
  const onClickExpandOrCollapse = useCallback(() => {
    if (shouldCollapse) {
      setExpanded({})
    }
    else {
      setExpanded(true)
    }
  }, [setExpanded, shouldCollapse])

  const buttonText = shouldCollapse
    ? t('common:action.collapse_all', 'Collapse All')
    : t('common:action.expand_all', 'Expand All')

  const Icon = shouldCollapse ? ChevronsDownUp : ChevronsUpDown

  return (
    <Button
      icon={resolvedIcon}
      variant='outlined'
      onPress={onClickExpandOrCollapse}
      aria-label={resolvedIcon ? buttonText : undefined}
    >
      {resolvedIcon ? <Icon size={18} /> : buttonText}
    </Button>
  )
}
