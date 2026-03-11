import classNames from 'classnames'
import { X } from 'lucide-react'

import { CategoriesListMode, type Classification, isClassificationAccountIdentifier } from '@schemas/categorization'
import type { AppForm } from '@hooks/features/forms/useForm'
import { Button } from '@ui/Button/Button'
import { VStack } from '@ui/Stack/Stack'
import { DebitCreditPill } from '@components/DebitCreditPill/DebitCreditPill'
import type { JournalEntryForm } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'
import { TagDimensionsGroup } from '@components/Tags/TagDimensionsGroup/TagDimensionsGroup'

import './journalEntryLineItem.scss'
import { useTranslation } from 'react-i18next'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export interface JournalEntryLineItemProps {
  form: AppForm<JournalEntryForm>
  index: number
  displayIndex: number
  isReadOnly: boolean
  onDeleteLine: () => void
  showTags?: boolean
}

export const JournalEntryLineItem = ({ form, index, displayIndex, isReadOnly, onDeleteLine, showTags = false }: JournalEntryLineItemProps) => {
  const { t } = useTranslation()
  const showLabels = displayIndex === 0

  return (
    <VStack gap='xs'>
      <div
        className={classNames(`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem`, isReadOnly && `${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem--readonly`)}
      >
        <form.Field name={`lineItems[${index}].accountIdentifier`}>
          {(field) => {
            const onValueChange = (value: Classification | null) => {
              if (value === null || !isClassificationAccountIdentifier(value)) {
                return
              }
              field.setValue(value)
            }
            return (
              <LedgerAccountCombobox
                label={t('account', 'Account')}
                value={field.state.value}
                mode={CategoriesListMode.All}
                onValueChange={onValueChange}
                isReadOnly={isReadOnly}
                showLabel={showLabels}
                className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--accountName`}
              />
            )
          }}
        </form.Field>

        <form.AppField name={`lineItems[${index}].amount`}>
          {field => (
            <field.FormBigDecimalField
              label={t('amount', 'Amount')}
              mode='currency'
              showLabel={showLabels}
              allowNegative={false}
              isReadOnly={isReadOnly}
              className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--amount`}
              slots={{ badge: (
                <form.AppField name={`lineItems[${index}].direction`}>
                  {directionField => (
                    <DebitCreditPill
                      value={directionField.state.value}
                      onChange={directionField.setValue}
                      isReadOnly={isReadOnly}
                    />
                  )}
                </form.AppField>
              ),
              }}
            />
          )}
        </form.AppField>

        <form.AppField name={`lineItems[${index}].tags`}>
          {field => (
            <TagDimensionsGroup
              value={field.state.value}
              onChange={field.setValue}
              showLabels={showLabels}
              isReadOnly={isReadOnly}
              isEnabled={showTags}
            />
          )}
        </form.AppField>

        <form.AppField name={`lineItems[${index}].memo`}>
          {field => (
            <field.FormTextField
              label={t('memo', 'Memo')}
              showLabel={showLabels}
              isReadOnly={isReadOnly}
              className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--memo`}
            />
          )}
        </form.AppField>

        {!isReadOnly && displayIndex !== 0 && (
          <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--removeButton`}>
            <Button
              variant='outlined'
              icon
              aria-label={t('deleteLineItem', 'Delete line item')}
              onPress={onDeleteLine}
            >
              <X size={16} />
            </Button>
          </div>
        )}
      </div>
    </VStack>
  )
}
