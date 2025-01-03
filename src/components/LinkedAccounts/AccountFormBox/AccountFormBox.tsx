import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { LinkedAccount } from '../../../types/linked_accounts'
import InstitutionIcon from '../../../icons/InstitutionIcon'
import { Checkbox } from '../../ui/Checkbox/Checkbox'
import { Text, TextSize } from '../../Typography'
import { InputGroup, AmountInput } from '../../Input'
import { DatePicker } from '../../DatePicker'
import { isEqual, startOfDay } from 'date-fns'
import classNames from 'classnames'

export type AccountFormBoxData = {
  account: LinkedAccount
  isConfirmed: boolean
  openingDate?: Date
  openingBalance?: string
}

export type AccountFormBoxRef = {
  getData: () => AccountFormBoxData
}

type AccountFormProps = {
  account: LinkedAccount
  defaultValue: AccountFormBoxData
  disableConfirmExclude?: boolean
}

const CLASS_NAME = 'Layer__caobfb'

const AccountFormBox = forwardRef(({
  account,
  defaultValue,
  disableConfirmExclude = false,
}: AccountFormProps,
ref) => {
  const [formState, setFormState] = useState<AccountFormBoxData>(defaultValue)

  useImperativeHandle(ref, () => ({
    getData: () => formState,
  }))

  return (
    <div className={classNames(CLASS_NAME, formState.isConfirmed && `${CLASS_NAME}--confirmed`)}>
      <div className={`${CLASS_NAME}__icon-col`}>
        {account.institution?.logo != undefined
          ? (
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
          )
          : (
            <InstitutionIcon />
          )}
      </div>
      <div className={`${CLASS_NAME}__details-col`}>
        <div className={`${CLASS_NAME}__details-col__details`}>
          <div className={`${CLASS_NAME}__details-col__name`}>
            <Text
              className={`${CLASS_NAME}__details-col__name__institution-name`}
              size={TextSize.sm}
            >
              {account.institution?.name}
            </Text>
            <Text
              className={`${CLASS_NAME}__details-col__name__account-name`}
              size={TextSize.sm}
            >
              {account.external_account_name}
            </Text>
          </div>
          <Text size={TextSize.sm}>
            •••
            {account.mask}
          </Text>
        </div>
        <div className={`${CLASS_NAME}__details-col__inputs`}>
          <InputGroup label='Opening date'>
            <DatePicker
              mode='dayPicker'
              onChange={(v) => {
                if (!formState.openingDate || !isEqual(formState.openingDate, v as Date)) {
                  setFormState({ ...formState, openingDate: (v as Date) })
                }
              }}
              selected={formState.openingDate ?? startOfDay(new Date())}
              currentDateOption={false}
              disabled={!disableConfirmExclude && !formState.isConfirmed}
            />
          </InputGroup>
          <InputGroup label='Opening balance'>
            <AmountInput
              name='openingBalance'
              defaultValue={formState.openingBalance}
              onChange={value =>
                setFormState({ ...formState, openingBalance: value })}
              disabled={!disableConfirmExclude && !formState.isConfirmed}
            />
          </InputGroup>
        </div>
      </div>
      {!disableConfirmExclude && (
        <div className={`${CLASS_NAME}__confirm-col`}>
          <Checkbox
            isSelected={formState.isConfirmed}
            onChange={v => setFormState({ ...formState, isConfirmed: v })}
            aria-label='Confirm Account Inclusion'
          />
        </div>
      )}
    </div>
  )
})

AccountFormBox.displayName = 'AccountFormBox'

export { AccountFormBox }
