import { useMemo, useState } from 'react'
import { CloudDownload, CloudUpload, PencilRuler } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useHandleDownloadTransactions } from '@hooks/features/bankTransactions/useHandleBankTransactionsDownload'
import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { BankTransactionsUploadModal } from '@components/BankTransactions/BankTransactionsUploadModal/BankTransactionsUploadModal'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'
import InvisibleDownload from '@components/utility/InvisibleDownload'

interface BankTransactionsHeaderMenuProps {
  actions: BankTransactionsHeaderMenuActions[]
  isDisabled?: boolean
  isListView?: boolean
}

export enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
}

export const BankTransactionsHeaderMenu = ({ actions, isDisabled, isListView = false }: BankTransactionsHeaderMenuProps) => {
  const { t } = useTranslation()
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { handleDownloadTransactions, invisibleDownloadRef } = useHandleDownloadTransactions({ isListView })

  const menuItems = useMemo<DataTableHeaderMenuItem[]>(() => {
    const items: DataTableHeaderMenuItem[] = [{
      key: 'DownloadTransactions',
      onClick: handleDownloadTransactions,
      icon: <CloudDownload size={16} />,
      label: t('bankTransactions:action.download_transactions', 'Download transactions'),
    }]

    if (actions.includes(BankTransactionsHeaderMenuActions.UploadTransactions)) {
      items.push({
        key: BankTransactionsHeaderMenuActions.UploadTransactions,
        onClick: () => setIsModalOpen(true),
        icon: <CloudUpload size={16} />,
        label: t('bankTransactions:action.upload_transactions_manually', 'Upload transactions manually'),
      })
    }

    if (actions.includes(BankTransactionsHeaderMenuActions.ManageCategorizationRules)) {
      items.push({
        key: BankTransactionsHeaderMenuActions.ManageCategorizationRules,
        onClick: toCategorizationRulesTable,
        icon: <PencilRuler size={16} strokeWidth={1.25} />,
        label: t('bankTransactions:action.manage_categorization_rules', 'Manage categorization rules'),
      })
    }

    return items
  }, [t, actions, toCategorizationRulesTable, handleDownloadTransactions])

  return (
    <>
      <DataTableHeaderMenu
        ariaLabel={t('bankTransactions:label.additional_bank_transaction_actions', 'Additional bank transactions actions')}
        items={menuItems}
        isDisabled={isDisabled}
      />
      <InvisibleDownload ref={invisibleDownloadRef} />
      {isModalOpen && <BankTransactionsUploadModal isOpen onOpenChange={setIsModalOpen} />}
    </>
  )
}
