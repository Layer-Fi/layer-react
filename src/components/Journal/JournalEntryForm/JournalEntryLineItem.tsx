import classNames from 'classnames'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Button } from '../../ui/Button/Button'
import { Trash } from 'lucide-react'
import type { AppForm } from '../../../features/forms/hooks/useForm'
import type { JournalEntryForm } from './journalEntryFormSchemas'
import './journalEntryLineItem.scss'
import { LedgerAccountCombobox } from '../../LedgerAccountCombobox/LedgerAccountCombobox'
import { CategoriesListMode } from '../../../types/categories'
import { AccountIdentifier } from '../../../schemas/accountIdentifier'
import { TagDimensionCombobox } from '../../../features/tags/components/TagDimensionCombobox'
import { getAdditionalTags, getSelectedTag, INVOICE_MECE_TAG_DIMENSION } from '../../Invoices/InvoiceForm/formUtils'
import { Tag } from '../../../features/tags/tagSchemas'

const JOURNAL_ENTRY_FORM_CSS_PREFIX = 'Layer__JournalEntryForm'

export interface JournalEntryLineItemProps {
  form: AppForm<JournalEntryForm>
  index: number
  isReadOnly: boolean
  onDeleteLine: () => void
}

export const JournalEntryLineItem = ({ form, index, isReadOnly, onDeleteLine }: JournalEntryLineItemProps) => {
  return (
    <VStack gap='xs'>
      <HStack
        gap='xs'
        align='end'
        className={classNames(`${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem`, isReadOnly && `${JOURNAL_ENTRY_FORM_CSS_PREFIX}__LineItem--readonly`)}
      >
        {/* Account Name Field - Using form account identifier structure */}
        <form.AppField name={`lineItems[${index}].accountIdentifier`}>
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
                showLabel={index === 0}
              />
            )
          }}
        </form.AppField>

        {/* Amount Field */}
        <form.AppField name={`lineItems[${index}].amount`}>
          {field => <field.FormBigDecimalField label='Amount' mode='currency' showLabel={index === 0} allowNegative={false} isReadOnly={isReadOnly} />}
        </form.AppField>

        <form.AppField name={`lineItems[${index}].tags`}>
          {(field) => {
            const additionalTags = getAdditionalTags(field.state.value)
            const selectedTag = getSelectedTag(field.state.value)

            const onValueChange = (value: Tag | null) => {
              field.setValue(value ? [...additionalTags, value] : additionalTags)
            }

            return (
              <TagDimensionCombobox
                dimensionKey={INVOICE_MECE_TAG_DIMENSION}
                isReadOnly={isReadOnly}
                value={selectedTag}
                onValueChange={onValueChange}
                showLabel={index === 0}
              />
            )
          }}
        </form.AppField>

        {/* Description Field */}
        <form.AppField name={`lineItems[${index}].memo`}>
          {field => <field.FormTextField label='Memo' showLabel={index === 0} isReadOnly={isReadOnly} />}
        </form.AppField>

        {/* Remove Button */}
        {!isReadOnly
          && <Button variant='outlined' icon inset aria-label='Delete line item' onPress={onDeleteLine}><Trash size={16} /></Button>}
      </HStack>
    </VStack>
  )
}
