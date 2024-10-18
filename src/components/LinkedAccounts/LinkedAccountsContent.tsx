import React, { useContext } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import { LinkedAccountItemThumb } from './LinkedAccountItemThumb'

interface LinkedAccountsDataProps {
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
}

export const LinkedAccountsContent = ({
  asWidget,
  showLedgerBalance,
  showUnlinkItem,
  showBreakConnection,
}: LinkedAccountsDataProps) => {
  const { data } = useContext(LinkedAccountsContext)

  return (
    <div className='Layer__linked-accounts__list'>
      {data?.map((account, index) => (
        <LinkedAccountItemThumb
          key={index}
          account={account}
          showLedgerBalance={showLedgerBalance}
          showUnlinkItem={showUnlinkItem}
          showBreakConnection={showBreakConnection}
          asWidget={asWidget}
        />
      ))}
    </div>
  )
}
