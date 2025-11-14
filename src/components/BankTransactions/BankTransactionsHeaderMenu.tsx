import { useMemo, useState } from 'react'
import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BankTransactionsUploadModal } from '@components/BankTransactions/BankTransactionsUploadModal/BankTransactionsUploadModal'
import UploadCloud from '@icons/UploadCloud'
import { PencilRuler } from 'lucide-react'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'

interface BankTransactionsHeaderMenuProps {
  withUploadMenu?: boolean
  isDisabled?: boolean
}

enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
}

export const BankTransactionsHeaderMenu = ({ withUploadMenu, isDisabled }: BankTransactionsHeaderMenuProps) => {
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => {
    const items: DataTableHeaderMenuItem[] = []

    if (withUploadMenu) {
      items.push({
        key: BankTransactionsHeaderMenuActions.UploadTransactions,
        onClick: () => setIsModalOpen(true),
        icon: <UploadCloud size={16} />,
        label: 'Upload transactions manually',
      })
    }

    items.push({
      key: BankTransactionsHeaderMenuActions.ManageCategorizationRules,
      onClick: toCategorizationRulesTable,
      icon: <PencilRuler size={16} strokeWidth={1.25} />,
      label: 'Manage categorization rules',
    })

    return items
  }, [withUploadMenu, toCategorizationRulesTable])

  return (
    <>
      <DataTableHeaderMenu
        ariaLabel='Additional bank transactions actions'
        items={menuItems}
        isDisabled={isDisabled}
      />
      {isModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}
