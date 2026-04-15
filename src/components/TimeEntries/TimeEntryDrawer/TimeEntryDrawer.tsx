import { useCallback, useState } from 'react'
import { Edit, Lock, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { TimeEntry } from '@schemas/timeTracking'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { TimeEntryForm } from '@components/TimeEntries/TimeEntryForm/TimeEntryForm'

interface TimeEntryDrawerProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  entry: TimeEntry | null
  onSuccess: () => void
  onDeleteEntry: (entry: TimeEntry) => void
}

const TimeEntryDrawerHeader = ({
  title,
  close,
  isLocked,
  isMobile,
  invoicedLabel,
}: {
  title: string
  close: () => void
  isLocked?: boolean
  isMobile?: boolean
  invoicedLabel: string
}) => (
  <ModalTitleWithClose
    heading={(
      <HStack gap='sm' align='center'>
        <ModalHeading size='md'>{title}</ModalHeading>
        {isLocked && (
          <Badge variant={BadgeVariant.WARNING} size={BadgeSize.SMALL} icon={<Lock size={12} />}>
            {invoicedLabel}
          </Badge>
        )}
      </HStack>
    )}
    onClose={close}
    hideBottomPadding={isMobile}
  />
)

export const TimeEntryDrawer = ({ isOpen, onOpenChange, entry, onDeleteEntry, onSuccess }: TimeEntryDrawerProps) => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useSizeClass()
  const [isEditMode, setIsEditMode] = useState(false)

  const hasEntry = entry !== null
  const isLocked = !!entry?.invoiceLineItem
  const isReadOnly = isLocked || (!isEditMode && hasEntry && (isMobile || isTablet))
  const title = entry ? t('timeTracking:label.entry_details', 'Time entry details') : t('timeTracking:action.add_entry', 'Add time entry')
  const invoicedLabel = t('timeTracking:label.invoiced', 'Invoiced')

  const handleOpenChange = useCallback((nextIsOpen: boolean) => {
    if (!nextIsOpen) {
      setIsEditMode(false)
    }
    onOpenChange(nextIsOpen)
  }, [onOpenChange])

  const Header = useCallback(({ close }: { close: () => void }) => (
    <TimeEntryDrawerHeader
      title={title}
      close={close}
      isLocked={isLocked}
      isMobile={isMobile}
      invoicedLabel={invoicedLabel}
    />
  ), [title, isLocked, isMobile, invoicedLabel])

  const handleDeleteEntry = useCallback(() => {
    if (entry) {
      onDeleteEntry(entry)
    }
  }, [entry, onDeleteEntry])

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      isDismissable
      variant={isMobile ? 'mobile-drawer' : 'drawer'}
      flexBlock={isMobile}
      aria-label={title}
      slots={{ Header }}
    >
      {({ close }) => {
        return (
          <VStack pb='lg'>
            <VStack gap='md'>
              <TimeEntryForm
                isReadOnly={isReadOnly}
                entry={entry ?? undefined}
                onSuccess={() => {
                  onSuccess()
                  close()
                }}
              />
              {hasEntry && isReadOnly && !isLocked && (
                <HStack pie='lg' gap='xs' justify='end' pbs='sm'>
                  <Button variant='outlined' onPress={handleDeleteEntry}>
                    <Trash2 size={16} />
                    {t('timeTracking:action.delete_entry', 'Delete Entry')}
                  </Button>
                  <Button onPress={() => setIsEditMode(true)}>
                    <Edit size={16} />
                    {t('timeTracking:action.edit_entry', 'Edit Entry')}
                  </Button>
                </HStack>
              )}
            </VStack>
          </VStack>
        )
      }}
    </Drawer>
  )
}
