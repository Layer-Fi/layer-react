import { useCallback, useMemo, useState } from 'react'
import { MenuIcon, PencilRuler } from 'lucide-react'

import { bankTransactionFiltersToHookOptions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsDownload } from '@hooks/useBankTransactions/useBankTransactionsDownload'
import { useBankTransactionsNavigation } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import DownloadCloud from '@icons/DownloadCloud'
import UploadCloud from '@icons/UploadCloud'
import { BankTransactionsUploadModal } from '@components/BankTransactions/BankTransactionsUploadModal/BankTransactionsUploadModal'
import { DataTableHeaderMenu, type DataTableHeaderMenuItem } from '@components/DataTable/DataTableHeaderMenu'
import InvisibleDownload, { useInvisibleDownload } from '@components/utility/InvisibleDownload'

interface BankTransactionsHeaderMenuProps {
  actions: BankTransactionsHeaderMenuActions[]
  isDisabled?: boolean
}

export enum BankTransactionsHeaderMenuActions {
  UploadTransactions = 'UploadTransactions',
  ManageCategorizationRules = 'ManageCategorizationRules',
  DownloadTransactions = 'DownloadTransactions',
}

export const BankTransactionsHeaderMenu = ({ actions, isDisabled }: BankTransactionsHeaderMenuProps) => {
  const { toCategorizationRulesTable } = useBankTransactionsNavigation()
  const { addToast } = useLayerContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { trigger } = useBankTransactionsDownload()
  const { filters } = useBankTransactionsFiltersContext()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const handleDownloadTransactions = () => {
    void trigger(bankTransactionFiltersToHookOptions(filters))
      .then((result) => {
        if (result?.presignedUrl) {
          triggerInvisibleDownload({ url: result.presignedUrl })
        }
        else {
          addToast({ content: 'Download Failed, Please Retry', type: 'error' })
        }
      })
      .catch(() => {
        addToast({ content: 'Download Failed, Please Retry', type: 'error' })
      })
  }

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

    if (actions.includes(BankTransactionsHeaderMenuActions.DownloadTransactions)) {
      items.push({
        key: BankTransactionsHeaderMenuActions.DownloadTransactions,
        onClick: () => handleDownloadTransactions(),
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
