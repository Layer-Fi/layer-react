import React, { RefObject } from 'react'
import { ChartOfAccountsForm } from '../ChartOfAccountsForm'
import { ChartOfAccountsFormStringOverrides } from '../ChartOfAccountsForm/ChartOfAccountsForm'

export const ChartOfAccountsSidebar = ({
  parentRef: _parentRef,
  stringOverrides,
}: {
  parentRef?: RefObject<HTMLDivElement>
  stringOverrides?: ChartOfAccountsFormStringOverrides
}) => {
  return <ChartOfAccountsForm stringOverrides={stringOverrides} />
}
