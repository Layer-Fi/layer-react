import { RefObject } from 'react'
import { ChartOfAccountsForm } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'
import { ChartOfAccountsFormStringOverrides } from '@components/ChartOfAccountsForm/ChartOfAccountsForm'

export const ChartOfAccountsSidebar = ({
  parentRef: _parentRef,
  stringOverrides,
}: {
  parentRef?: RefObject<HTMLDivElement>
  stringOverrides?: ChartOfAccountsFormStringOverrides
}) => {
  return <ChartOfAccountsForm stringOverrides={stringOverrides} />
}
