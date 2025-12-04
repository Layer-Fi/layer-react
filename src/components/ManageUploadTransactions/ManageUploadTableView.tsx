import type { ColumnConfig } from '@components/DataTable/DataTable'
  import { Row } from "@tanstack/react-table"
  import { asMutable } from '@utils/asMutable'
  import { useCallback, useState } from 'react'
  import { Trash2 } from 'lucide-react'
  import { Span } from '@ui/Typography/Text'
  import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
  import { DataState, DataStateStatus } from "@components/DataState/DataState"
  import { useManageUploads } from "@hooks/manageAccounts/useManageUploads"
  import { useDeleteUpload } from "@hooks/manageAccounts/useDeleteUpload"
  import { Container } from '@components/Container/Container'
  import { ExpandableDataTableProvider } from
  '@components/ExpandableDataTable/ExpandableDataTableProvider'
  import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'
  import { useLayerContext } from '@contexts/LayerContext/LayerContext'
  import type { TransactionUpload } from '@schemas/bankTransactions/transactionUpload'

  import './manageUploadTableView.scss'
import { uploadedDataType } from '@hooks/manageAccounts/types'

  const COMPONENT_NAME = 'ManageUpload'

  enum ManageUploadColumns {
    UploadDate = 'uploaded_at',
    UploadSource = 'upload_name',
    Account = 'custom_account_name',
    TransactionCount = 'transaction_count',
    Actions = 'actions',
  }

  const getSubRows = (upload: uploadedDataType) => upload.children

  export default function ManageUploadTableView() {
    const [selectedUpload, setSelectedUpload] = useState<uploadedDataType | null>(null)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const { addToast } = useLayerContext()

    const {
      data,
      isLoading,
      isError,
      refetch,
    } = useManageUploads()

    console.log({data})
    const { trigger: deleteUploadTrigger, isMutating: isDeleting } = useDeleteUpload(() => {
      void refetch()
    })

    const handleDelete = useCallback(async () => {
      if (selectedUpload) {
        try {
          await deleteUploadTrigger(selectedUpload.id)
          addToast({
            content: `Successfully deleted "${selectedUpload.upload_name}"`,
            type: 'success'
          })
          setShowDeleteConfirmation(false)
          setSelectedUpload(null)
        } catch (error) {
          console.error('Failed to delete upload:', error)
          addToast({
            content: 'Failed to delete upload. Please try again.',
            type: 'error'
          })
        }
      } 
    }, [selectedUpload, deleteUploadTrigger, addToast])

    const COLUMN_CONFIG: ColumnConfig<Row<uploadedDataType>, ManageUploadColumns> = {
      [ManageUploadColumns.UploadDate]: {
        id: ManageUploadColumns.UploadDate,
        header: 'Upload Date',
        cell: row => {
          const date = row.original.uploaded_at ? new Date(row.original.uploaded_at) : null
          return (
            <Span weight={row.depth === 0 ? 'bold' : 'normal'} ellipsis>
              {date ? date.toLocaleDateString() : '-'}
            </Span>
          )
        },
        isRowHeader: true,
      },
      [ManageUploadColumns.UploadSource]: {
        id: ManageUploadColumns.UploadSource,
        header: 'Upload Source',
        cell: row => (
          <Span weight={row.depth === 0 ? 'bold' : 'normal'} ellipsis>
            {row.original.upload_name ?? '-'}
          </Span>
        ),
      },
      [ManageUploadColumns.Account]: {
        id: ManageUploadColumns.Account,
        header: 'Account',
        cell: row => (
          <Span weight={row.depth === 0 ? 'bold' : 'normal'} ellipsis>
            {row.original.custom_account_name ?? '-'}
          </Span>
        ),
      },
      [ManageUploadColumns.TransactionCount]: {
        id: ManageUploadColumns.TransactionCount,
        header: 'Transaction Count',
        cell: row => (
          <Span weight={row.depth === 0 ? 'bold' : 'normal'} ellipsis>
            {row.original.transaction_count}
          </Span>
        ),
      },
      [ManageUploadColumns.Actions]: {
        id: ManageUploadColumns.Actions,
        header: '',
        cell: row => (
          <div
            className='Layer__ManageUpload__Actions'
            onClick={() => {
              setSelectedUpload(row.original)
              setShowDeleteConfirmation(true)
            }}
            role='button'
            tabIndex={0}
            aria-label='Delete upload'
          >
            <Trash2 size={16} className='Layer__ManageUpload__DeleteIcon' />
          </div>
        ),
      },
    }

    const ManageUploadEmptyState = useCallback(() => {
      return (
        <DataState
          status={DataStateStatus.allDone}
          title='No uploads found'
          description='There are no uploads to display.'
          spacing
        />
      )
    }, [])

    const ManageUploadErrorState = useCallback(() => (
      <DataState
        status={DataStateStatus.failed}
        title="We couldn't load your uploads"
        description='An error occurred while loading uploads. Please check your connection and try again.'
        onRefresh={() => { void refetch() }}
        spacing
      />
    ), [refetch])

    return (
      <Container name='ManageUpload'>
        <ExpandableDataTableProvider>
          <ExpandableDataTable
            ariaLabel='Uploads'
            data={data?.uploads}
            isLoading={isLoading}
            isError={isError}
            columnConfig={COLUMN_CONFIG}
            componentName={COMPONENT_NAME}
            slots={{
              ErrorState: ManageUploadErrorState,
              EmptyState: ManageUploadEmptyState,
            }}
            getSubRows={getSubRows}
          />
        </ExpandableDataTableProvider>
        {showDeleteConfirmation && (
          <BaseConfirmationModal
            isOpen={showDeleteConfirmation}
            onOpenChange={setShowDeleteConfirmation}
            title='Delete upload?'
            description={`Are you sure you want to delete data uploaded to ${selectedUpload?.custom_account_name}? This will remove all ${selectedUpload?.transaction_count} transactions associated with this upload.`}
            onConfirm={handleDelete}
            confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
            cancelLabel='Cancel'
            confirmDisabled={isDeleting}
          />
        )}
      </Container>
    )
  }
