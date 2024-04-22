import React, { RefObject } from 'react'
import { ChartOfAccountsForm } from '../ChartOfAccountsForm'

export const ChartOfAccountsSidebar = ({
  parentRef: _parentRef,
}: {
  parentRef?: RefObject<HTMLDivElement>
}) => {
  return <ChartOfAccountsForm />
}
