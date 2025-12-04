import { useCallback, useMemo, useState } from 'react'
import { MenuIcon, PencilRuler } from 'lucide-react'

import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import UploadCloud from '@icons/UploadCloud'
import Document from '@icons/Document'
import { BankTransactionsUploadModal } from '@components/BankTransactions/BankTransactionsUploadModal/BankTransactionsUploadModal'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'
import { BankTransactionsManageUploadModal } from './BankTransactionsManageUploadModal/BankTransactionsManageUploadModal'

interface BankTransactionsHeaderMenuProps {
  actions: BankTransactionsHeaderMenuActions[]
  isDisabled?: boolean
}

export enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
}

export const BankTransactionsHeaderMenu = ({ actions, isDisabled }: BankTransactionsHeaderMenuProps) => {
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => {
    const items: DataTableHeaderMenuItem[] = []

    if (actions.includes(BankTransactionsHeaderMenuActions.UploadTransactions)) {
      items.push({
        key: BankTransactionsHeaderMenuActions.UploadTransactions,
        onClick: () => setIsUploadModalOpen(true),
        icon: <UploadCloud size={16} />,
        label: 'Upload transactions manually',
      })
      items.push({
        key: BankTransactionsHeaderMenuActions.UploadTransactions,
        onClick: () => setIsManageModalOpen(true),
        icon: <Document size={16} />,
        label: 'Manage manual transactions',
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
  }, [actions, toCategorizationRulesTable])

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
      {isUploadModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsUploadModalOpen} />}
      {isManageModalOpen && <BankTransactionsManageUploadModal isOpen onOpenChange={setIsManageModalOpen} />}
    </>
  )
}
