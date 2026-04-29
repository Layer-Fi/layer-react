import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import CollapseIcon from '@icons/Collapse'
import ExpandIcon from '@icons/Expand'
import { Button } from '@ui/Button/Button'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'

export const ExpandableDataTableToggleButton = () => {
  const { t } = useTranslation()
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)
  const { isDesktop } = useSizeClass()

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

  const Icon = shouldCollapse ? CollapseIcon : ExpandIcon

  return (
    <Button icon={!isDesktop} variant='outlined' onClick={onClickExpandOrCollapse}>
      {!isDesktop ? <Icon /> : buttonText}
    </Button>
  )
}
