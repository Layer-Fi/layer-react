import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { RawAutomatedTask } from '@internal-types/tasks'
import { isCompletedTask } from '@utils/bookkeeping/tasks/bookkeepingTasksFilters'
import { getIconForTask } from '@utils/bookkeeping/tasks/getBookkeepingTaskStatusIcon'
import ChevronDownFill from '@icons/ChevronDownFill'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@components/Button/Button'

import './bulkCategorizationTaskListItem.scss'

type CategorizationScope = 'business' | 'personal'
type CategoryValue = 'electronics' | 'equipment' | 'office-expenses'
type ActionValue = 'mix' | 'other' | 'ask-later'
type MixedCategoryValue = CategoryValue | 'other'

export type BulkCategorizationTransaction = {
  id: string
  merchantName: string
  date: string
  amount: string
  initialCategory?: MixedCategoryValue
}

export type BulkCategorizationSelection = {
  scope: CategorizationScope
  category: CategoryValue | null
  action: ActionValue | null
  mixedCategories: Record<string, MixedCategoryValue>
}

type BulkCategorizationTaskListItemProps = {
  task: RawAutomatedTask
  defaultOpen: boolean
  description: string
  transactions?: ReadonlyArray<BulkCategorizationTransaction>
  onExpandTask?: (isOpen: boolean) => void
  onSave?: (selection: BulkCategorizationSelection) => void
}

const getInitialTransactionCategories = (
  transactions: ReadonlyArray<BulkCategorizationTransaction>,
): Record<string, MixedCategoryValue> => {
  return transactions.reduce<Record<string, MixedCategoryValue>>((acc, transaction) => {
    acc[transaction.id] = transaction.initialCategory ?? 'other'
    return acc
  }, {})
}

export const BulkCategorizationTaskListItem = forwardRef<HTMLDivElement, BulkCategorizationTaskListItemProps>((
  {
    task,
    defaultOpen,
    description,
    transactions = [],
    onExpandTask,
    onSave,
  },
  ref,
) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [scope, setScope] = useState<CategorizationScope>('business')
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue | null>('electronics')
  const [selectedAction, setSelectedAction] = useState<ActionValue | null>(null)
  const [mixedCategories, setMixedCategories] = useState<Record<string, MixedCategoryValue>>(
    getInitialTransactionCategories(transactions),
  )

  useEffect(() => {
    setIsOpen(defaultOpen)
  }, [defaultOpen])

  useEffect(() => {
    setMixedCategories((previousMixedCategories) => {
      return transactions.reduce<Record<string, MixedCategoryValue>>((acc, transaction) => {
        acc[transaction.id] = previousMixedCategories[transaction.id] ?? transaction.initialCategory ?? 'other'
        return acc
      }, {})
    })
  }, [transactions])

  const taskBodyClassName = classNames(
    'Layer__tasks-list-item__body',
    'Layer__bulk-categorization-task-list-item__body',
    isOpen && 'Layer__tasks-list-item__body--expanded',
    isCompletedTask(task) && 'Layer__tasks-list-item--completed',
  )

  const taskHeadClassName = classNames(
    'Layer__tasks-list-item__head-info',
    isCompletedTask(task)
      ? 'Layer__tasks-list-item--completed'
      : 'Layer__tasks-list-item--pending',
  )

  const taskItemClassName = classNames(
    'Layer__tasks-list-item',
    'Layer__bulk-categorization-task-list-item',
    isOpen && 'Layer__tasks-list-item__expanded',
  )

  const expandIconClassName = classNames(
    'Layer__tasks__expand-icon',
    !isOpen && 'Layer__tasks__expand-icon--collapsed',
  )

  const onClickTaskItemHead = useCallback(() => {
    setIsOpen(!isOpen)
    onExpandTask?.(!isOpen)
  }, [isOpen, onExpandTask])

  const isMixedMode = selectedAction === 'mix'

  const saveButtonLabel = isMixedMode
    ? t('saveAll', 'Save all')
    : t('save', 'Save')

  const scopeOptions = useMemo(
    () => [
      { label: t('business', 'Business'), value: 'business' as const },
      { label: t('personal', 'Personal'), value: 'personal' as const },
    ],
    [t],
  )

  const categoryOptions = useMemo(
    () => [
      { label: t('electronics', 'Electronics'), value: 'electronics' as const },
      { label: t('equipment', 'Equipment'), value: 'equipment' as const },
      { label: t('officeExpenses', 'Office Expenses'), value: 'office-expenses' as const },
    ],
    [t],
  )

  const actionOptions = useMemo(
    () => [
      { label: t('aMixOfTheAbove', 'A mix of the above'), value: 'mix' as const },
      { label: t('other', 'Other'), value: 'other' as const },
      { label: t('askMeLater', 'Ask me later'), value: 'ask-later' as const },
    ],
    [t],
  )

  const mixedCategoryOptions = useMemo(
    () => [
      { label: t('electronics', 'Electronics'), value: 'electronics' as const },
      { label: t('equipment', 'Equipment'), value: 'equipment' as const },
      { label: t('officeExpenses', 'Office Expenses'), value: 'office-expenses' as const },
      { label: t('other', 'Other'), value: 'other' as const },
    ],
    [t],
  )

  const handleSelectCategory = (value: CategoryValue) => {
    setSelectedCategory(value)
    setSelectedAction(null)
  }

  const handleSelectAction = (value: ActionValue) => {
    setSelectedAction(value)
    setSelectedCategory(null)
  }

  const handleSelectMixedCategory = (transactionId: string, value: MixedCategoryValue) => {
    setMixedCategories(previousMixedCategories => ({
      ...previousMixedCategories,
      [transactionId]: value,
    }))
  }

  const handleSave = () => {
    onSave?.({
      scope,
      category: selectedCategory,
      action: selectedAction,
      mixedCategories,
    })
  }

  return (
    <VStack className='Layer__tasks-list-item-wrapper Layer__bulk-categorization-task-list-item-wrapper' ref={ref}>
      <VStack className={taskItemClassName}>
        <button
          type='button'
          className='Layer__tasks-list-item__head Layer__bulk-categorization-task-list-item__head-button'
          onClick={onClickTaskItemHead}
        >
          <HStack className={taskHeadClassName}>
            <VStack className='Layer__tasks-list-item__head-info__status' align='center' justify='center'>
              {getIconForTask(task)}
            </VStack>
            <Span size='md' weight='normal'>
              {task.title}
            </Span>
          </HStack>
          <ChevronDownFill
            size={16}
            className={expandIconClassName}
          />
        </button>
        <VStack className={taskBodyClassName}>
          <VStack className='Layer__tasks-list-item__body-info Layer__bulk-categorization-task-list-item__body-info'>
            <Span size='sm' weight='bold' className='Layer__bulk-categorization-task-list-item__description'>
              {description}
            </Span>

            <HStack className='Layer__bulk-categorization-task-list-item__scope-toggle'>
              {scopeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={scope === option.value ? ButtonVariant.primary : ButtonVariant.secondary}
                  className={classNames(
                    'Layer__bulk-categorization-task-list-item__scope-toggle-button',
                    scope === option.value && 'Layer__bulk-categorization-task-list-item__button--selected',
                  )}
                  onClick={() => setScope(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </HStack>

            <HStack className='Layer__bulk-categorization-task-list-item__pill-row'>
              {categoryOptions.map(option => (
                <Button
                  key={option.value}
                  variant={selectedCategory === option.value ? ButtonVariant.primary : ButtonVariant.secondary}
                  className={classNames(
                    'Layer__bulk-categorization-task-list-item__pill-button',
                    selectedCategory === option.value && 'Layer__bulk-categorization-task-list-item__button--selected',
                  )}
                  onClick={() => handleSelectCategory(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </HStack>

            <HStack className='Layer__bulk-categorization-task-list-item__pill-row'>
              {actionOptions.map(option => (
                <Button
                  key={option.value}
                  variant={selectedAction === option.value ? ButtonVariant.primary : ButtonVariant.secondary}
                  className={classNames(
                    'Layer__bulk-categorization-task-list-item__pill-button',
                    selectedAction === option.value && 'Layer__bulk-categorization-task-list-item__button--selected',
                  )}
                  onClick={() => handleSelectAction(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </HStack>

            {isMixedMode && transactions.length > 0 && (
              <VStack className='Layer__bulk-categorization-task-list-item__transactions'>
                {transactions.map((transaction, transactionIndex) => (
                  <HStack
                    key={transaction.id}
                    className={classNames(
                      'Layer__bulk-categorization-task-list-item__transaction-row',
                      transactionIndex !== transactions.length - 1 && 'Layer__bulk-categorization-task-list-item__transaction-row--with-border',
                    )}
                    justify='space-between'
                    align='center'
                  >
                    <VStack className='Layer__bulk-categorization-task-list-item__transaction-details' gap='4xs'>
                      <Span size='sm' weight='bold'>{transaction.merchantName}</Span>
                      <Span size='sm' variant='subtle'>{`${transaction.date} • ${transaction.amount}`}</Span>
                    </VStack>
                    <HStack className='Layer__bulk-categorization-task-list-item__transaction-categories'>
                      {mixedCategoryOptions.map(option => (
                        <Button
                          key={`${transaction.id}-${option.value}`}
                          variant={mixedCategories[transaction.id] === option.value ? ButtonVariant.primary : ButtonVariant.secondary}
                          className={classNames(
                            'Layer__bulk-categorization-task-list-item__transaction-category-button',
                            mixedCategories[transaction.id] === option.value && 'Layer__bulk-categorization-task-list-item__button--selected',
                          )}
                          onClick={() => handleSelectMixedCategory(transaction.id, option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            )}

            <HStack className='Layer__tasks-list-item__actions Layer__bulk-categorization-task-list-item__actions'>
              <Button
                variant={ButtonVariant.primary}
                onClick={handleSave}
              >
                {saveButtonLabel}
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
})

BulkCategorizationTaskListItem.displayName = 'BulkCategorizationTaskListItem'
