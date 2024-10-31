import React, { useMemo, type PropsWithChildren } from 'react'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

const LIST_ITEM_CLASS_NAME = 'Layer__ProfitAndLossSummariesListItem'

type ProfitAndLossSummariesListItemProps = PropsWithChildren<{
  isActive?: boolean
  onClick?: () => void
}>

export function ProfitAndLossSummariesListItem({
  children,
  isActive,
  onClick,
}: ProfitAndLossSummariesListItemProps) {
  const dataProperties = useMemo(
    () => toDataProperties({ active: isActive, clickable: !!onClick }),
    [isActive],
  )

  return (
    <li className={LIST_ITEM_CLASS_NAME} {...dataProperties} onClick={onClick}>
      {children}
    </li>
  )
}

const LIST_CLASS_NAME = 'Layer__ProfitAndLossSummariesList'

type ProfitAndLossSummariesListProps = PropsWithChildren<{
  itemCount?: number
}>

export function ProfitAndLossSummariesList({
  children,
  itemCount,
}: ProfitAndLossSummariesListProps) {
  const dataProperties = useMemo(
    () => toDataProperties({ ['column-count']: itemCount }),
    [itemCount],
  )

  return (
    <ul className={LIST_CLASS_NAME} {...dataProperties}>
      {children}
    </ul>
  )
}
