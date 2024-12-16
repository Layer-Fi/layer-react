import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { isEqual, startOfDay } from 'date-fns'
import classNames from 'classnames'
import type { LinkedAccount } from '../../../types/linked_accounts'
import { Heading } from '../../ui/Typography/Heading'
import { P } from '../../ui/Typography/Text'
import { VStack, Stack } from '../../ui/Stack/Stack'
import { Checkbox } from  '../../ui/Checkbox/Checkbox'
import { InputGroup } from '../../Input'
import { AmountInput } from '../../Input/AmountInput'
import { DatePicker } from '../../DatePicker'
import InstitutionIcon from '../../../icons/InstitutionIcon'

export type ConfirmAndOpeningBalanceFormData = {
  account: LinkedAccount
  isConfirmed: boolean
  openingDate?: Date
  openingBalance?: string
}

export type ConfirmAndOpeningBalanceFormRef = {
  getData: () => ConfirmAndOpeningBalanceFormData
}

type ConfirmAndOpeningBalanceFormProps = {
  account: LinkedAccount
  defaultValue: ConfirmAndOpeningBalanceFormData
  compact?: boolean
  disableConfirmExclude?: boolean
}

const CLASS_NAME = 'Layer__confirm-and-opening-balance-form'

const ConfirmAndOpeningBalanceForm = forwardRef(({
  account,
  defaultValue,
  compact,
  disableConfirmExclude = false,
}: ConfirmAndOpeningBalanceFormProps,
ref) => {
  const [formState, setFormState] = useState<ConfirmAndOpeningBalanceFormData>(defaultValue)
  
  useImperativeHandle(ref, () => ({
    getData: () => formState,
  }))

  return (
    <div className={classNames(CLASS_NAME, compact && `${CLASS_NAME}--compact`)}>
      {!compact && (
        <VStack justify='start'>
          {account.institution?.logo != undefined ? (
            <img
              width={32}
              height={32}
              src={`data:image/png;base64,${account.institution.logo}`}
              alt={
                account.institution?.name
                  ? account.institution?.name
                  : account.external_account_name
              }
            />
          ) : (
            <InstitutionIcon />
          )}
        </VStack>
      )}
      <VStack gap='sm' className={`${CLASS_NAME}__main-col`}>
        <VStack gap='3xs'>
          <Heading level={3} size='sm'>{account.external_account_name}</Heading>
          <P slot='mask'>
            ••• {account.mask}
          </P>
          <P slot='institution'>
            {account.institution.name}
          </P>
        </VStack>

        <Stack direction={compact ? 'column' : 'row'} gap='sm' align='start' className={`${CLASS_NAME}__form`}>
          <InputGroup label='Opening date'>
            <DatePicker
              mode='dayPicker'
              onChange={v => {
                if (!formState.openingDate || !isEqual(formState.openingDate, v as Date)) {
                  setFormState({ ...formState, openingDate: (v as Date) })
                }
              }}
              selected={formState.openingDate ?? startOfDay(new Date())}
              currentDateOption={false}
            />
          </InputGroup>
          <InputGroup label='Opening balance'>
            <AmountInput
              name='openingBalance' defaultValue={formState.openingBalance} onChange={value => 
                setFormState({ ...formState, openingBalance: value })
              } />
          </InputGroup>
        </Stack>
      </VStack>
      {!disableConfirmExclude && (
        <VStack justify='start'>
          <Checkbox
            isSelected={formState.isConfirmed}
            onChange={v => setFormState({ ...formState, isConfirmed: v })}
            aria-label='Confirm Account Inclusion'
          />
        </VStack> 
      )}
    </div>
  )
})

ConfirmAndOpeningBalanceForm.displayName = 'ConfirmAndOpeningBalanceForm'

export { ConfirmAndOpeningBalanceForm }
