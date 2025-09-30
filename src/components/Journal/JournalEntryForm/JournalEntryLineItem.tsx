import classNames from 'classnames'
import { X } from 'lucide-react'
import { VStack } from '../../ui/Stack/Stack'
import { Button } from '../../ui/Button/Button'
import type { AppForm } from '../../../features/forms/hooks/useForm'
import type { JournalEntryForm } from './journalEntryFormSchemas'
import './journalEntryLineItem.scss'
import { LedgerAccountCombobox } from '../../LedgerAccountCombobox/LedgerAccountCombobox'
import { AccountIdentifier } from '../../../schemas/accountIdentifier'
import { TagDimensionsGroup } from './TagDimensionsGroup'
import { DebitCreditPill } from '../../DebitCreditPill/DebitCreditPill'
import { CategoriesListMode } from '../../../schemas/categorization'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export interface JournalEntryLineItemProps {
  form: AppForm<JournalEntryForm>
  index: number
  isReadOnly: boolean
  onDeleteLine: () => void
  showLabels?: boolean
  showTags?: boolean
}

export const JournalEntryLineItem = ({ form, index, isReadOnly, onDeleteLine, showLabels = false, showTags = false }: JournalEntryLineItemProps) => {
  return (
    <VStack gap='xs'>
      <div
        className={classNames(`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem`, isReadOnly && `${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem--readonly`)}
      >
        <form.Field name={`lineItems[${index}].accountIdentifier`}>
          {(field) => {
            const onValueChange = (value: AccountIdentifier | null) => {
              if (value === null) {
                return
              }
              field.setValue(value)
            }
            return (
              <LedgerAccountCombobox
                label='Account'
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
              label='Amount'
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
              label='Memo'
              showLabel={showLabels}
              isReadOnly={isReadOnly}
              className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--memo`}
            />
          )}
        </form.AppField>

        {!isReadOnly && (
          <div className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--removeButton`}>
            <Button
              variant='outlined'
              icon
              inset
              aria-label='Delete line item'
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
