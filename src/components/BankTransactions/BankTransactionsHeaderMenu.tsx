import { useCallback, useMemo, useState } from 'react'
import { MenuIcon, PencilRuler } from 'lucide-react'

import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import DownloadCloud from '@icons/DownloadCloud'
import UploadCloud from '@icons/UploadCloud'
import { BankTransactionsUploadModal } from '@components/BankTransactions/BankTransactionsUploadModal/BankTransactionsUploadModal'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'
import type { InvisibleDownloadHandle } from '@components/utility/InvisibleDownload'
import InvisibleDownload from '@components/utility/InvisibleDownload'

interface BankTransactionsHeaderMenuProps {
  actions: BankTransactionsHeaderMenuActions[]
  isDisabled?: boolean
  handleDownloadTransactions?: () => void
  invisibleDownloadRef?: React.RefObject<InvisibleDownloadHandle>
}

export enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
  DownloadTransactions = 'DownloadTransactions',
}

export const BankTransactionsHeaderMenu = ({ actions, isDisabled, handleDownloadTransactions, invisibleDownloadRef }: BankTransactionsHeaderMenuProps) => {
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => {
    const items: DataTableHeaderMenuItem[] = []

    if (actions.includes(BankTransactionsHeaderMenuActions.UploadTransactions)) {
      items.push({
        key: BankTransactionsHeaderMenuActions.UploadTransactions,
        onClick: () => setIsModalOpen(true),
        icon: <UploadCloud size={16} />,
        label: 'Upload transactions manually',
      })
    }

    if (actions.includes(BankTransactionsHeaderMenuActions.DownloadTransactions) && handleDownloadTransactions) {
      items.push({
        key: BankTransactionsHeaderMenuActions.DownloadTransactions,
        onClick: handleDownloadTransactions,
        icon: <DownloadCloud size={16} />,
        label: 'Download transactions',
      })
    }

    if (actions.includes(BankTransactionsHeaderMenuActions.ManageCategorizationRules)) {
      items.push({
        key: BankTransactionsHeaderMenuActions.ManageCategorizationRules,
        onClick: toCategorizationRulesTable,
        icon: <PencilRuler size={16} strokeWidth={1.25} />,
        label: 'Manage categorization rules',
      })
    }

    return items
  }, [actions, toCategorizationRulesTable, handleDownloadTransactions])

  const Icon = useCallback(() => {
    if (actions.length === 1 && actions[0] === BankTransactionsHeaderMenuActions.UploadTransactions) {
      return <UploadCloud size={16} />
    }
    return <MenuIcon size={14} />
  }, [actions])

  if (menuItems.length === 0) {
    return null
  }

  return (
    <>
      <DataTableHeaderMenu
        ariaLabel='Additional bank transactions actions'
        items={menuItems}
        isDisabled={isDisabled}
        slots={{ Icon }}
      />
      {actions.includes(
        BankTransactionsHeaderMenuActions.DownloadTransactions,
      ) && <InvisibleDownload ref={invisibleDownloadRef} />}
      {isModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}
