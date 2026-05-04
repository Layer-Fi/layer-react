import { HStack } from '@ui/Stack/Stack'
import { TaxCodeSelect } from '@components/TaxCodeSelect/TaxCodeSelect'

import {
  type BankTransactionsMobileListSplitFormLocalSplit,
  useBankTransactionsMobileListSplitFormContext,
} from './BankTransactionsMobileListSplitFormContext'

interface BankTransactionsMobileListSplitFormTaxCodeFieldProps {
  split: BankTransactionsMobileListSplitFormLocalSplit
  splitIndex: number
}

export const BankTransactionsMobileListSplitFormTaxCodeField = ({
  split,
  splitIndex,
}: BankTransactionsMobileListSplitFormTaxCodeFieldProps) => {
  const {
    categorization: { onBlurSplitField },
    transaction: { showCategorization },
    taxCodes: {
      taxCodeOptions,
      handleTaxCodeChange,
      getSelectedTaxCodeOption,
    },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <>
      <HStack pis='3xs' aria-hidden='true' />
      <TaxCodeSelect
        isMobileView
        options={taxCodeOptions}
        value={getSelectedTaxCodeOption(split.taxCode ?? null)}
        onChange={handleTaxCodeChange(splitIndex)}
        onBlur={onBlurSplitField}
        isDisabled={!showCategorization}
        className='Layer__BankTransactionsMobileListSplitForm__TaxCodeSelect'
      />
    </>
  )
}
