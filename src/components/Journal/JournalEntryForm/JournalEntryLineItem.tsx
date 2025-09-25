import classNames from 'classnames'
import { X } from 'lucide-react'
import { VStack } from '../../ui/Stack/Stack'
import { Button } from '../../ui/Button/Button'
import type { AppForm } from '../../../features/forms/hooks/useForm'
import type { JournalEntryForm } from './journalEntryFormSchemas'
import './journalEntryLineItem.scss'
import { LedgerAccountCombobox } from '../../LedgerAccountCombobox/LedgerAccountCombobox'
import { CategoriesListMode } from '../../../types/categories'
import { AccountIdentifier } from '../../../schemas/accountIdentifier'
import { JournalConfig } from '../Journal'
import { TagDimensionsGroup } from './TagDimensionsGroup'
import { DebitCreditPill } from '../../DebitCreditPill/DebitCreditPill'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export interface JournalEntryLineItemProps {
  form: AppForm<JournalEntryForm>
  index: number
  isReadOnly: boolean
  onDeleteLine: () => void
  showLabels?: boolean // Whether to show field labels for this line item
  config?: JournalConfig
}

export const JournalEntryLineItem = ({ form, index, isReadOnly, onDeleteLine, config, showLabels = false }: JournalEntryLineItemProps) => {
  return (
    <VStack gap='xs'>
      <div
        className={classNames(`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem`, isReadOnly && `${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem--readonly`)}
      >
        {/* Account Name Field - Using form account identifier structure */}
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

        {/* Amount Field */}
        <form.AppField name={`lineItems[${index}].amount`}>
          {field => (
            <field.FormBigDecimalField
              label='Amount'
              mode='currency'
              showLabel={showLabels}
              allowNegative={false}
              isReadOnly={isReadOnly}
              className={`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field ${JOURNAL_ENTRY_FORM_CSS_PREFIX}__Field--amount`}
              rightSlot={(
                <form.AppField name={`lineItems[${index}].direction`}>
                  {directionField => (
                    <DebitCreditPill
                      value={directionField.state.value}
                      onChange={directionField.setValue}
                      isReadOnly={isReadOnly}
                    />
                  )}
                </form.AppField>
              )}
            />
          )}
        </form.AppField>

        {/* Tag/Job Dimension Fields - Single form field with custom component */}
        <form.AppField name={`lineItems[${index}].tags`}>
          {field => (
            <TagDimensionsGroup
              dimensionKeys={config?.form?.tagDimensionKeysInUse}
              value={field.state.value}
              onChange={field.setValue}
              showLabels={showLabels}
              isReadOnly={isReadOnly}
            />
          )}
        </form.AppField>

        {/* Memo Field */}
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

        {/* Remove Button - Updated to match Figma design with X icon */}
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
