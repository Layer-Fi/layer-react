import React from 'react'
import { LinkedAccount } from '../../../types/linked_accounts'
import InstitutionIcon from '../../../icons/InstitutionIcon'
import { Checkbox } from '../../ui/Checkbox/Checkbox'
import { ErrorText, Text, TextSize } from '../../Typography'
import { InputGroup } from '../../Input'
import { AmountInput } from '../../Input/AmountInput'
import { DatePicker } from '../../DatePicker'
import { isEqual, startOfDay } from 'date-fns'
import classNames from 'classnames'
import { ErrorType } from '../OpeningBalanceModal/useUpdateOpeningBalanceAndDate'

export type AccountFormBoxData = {
  account: LinkedAccount
  isConfirmed: boolean
  openingDate?: Date
  openingBalance?: string
  saved?: boolean
}

type AccountFormProps = {
  account: LinkedAccount
  defaultValue: AccountFormBoxData
  disableConfirmExclude?: boolean
  errors?: ErrorType[]
  onChange: (val: AccountFormBoxData) => void
}

const CLASS_NAME = 'Layer__caobfb'

export const AccountFormBox = ({
  account,
  defaultValue,
  disableConfirmExclude = false,
  onChange,
  errors = [],
}: AccountFormProps) => {
  const formState = defaultValue

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
                  onChange({ ...formState, openingDate: (v as Date) })
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
                onChange({ ...formState, openingBalance: value })}
              disabled={!disableConfirmExclude && !formState.isConfirmed}
              isInvalid={errors.includes('MISSING_BALANCE')}
              errorMessage='Field is required'
            />
          </InputGroup>
        </div>
        {errors.includes('API_ERROR') && (
          <ErrorText>
            An error occurred while saving data.
            You will have an opportunity to try again later.
          </ErrorText>
        )}
      </div>
      {!disableConfirmExclude && (
        <div className={`${CLASS_NAME}__confirm-col`}>
          <Checkbox
            isSelected={formState.isConfirmed}
            onChange={v => onChange({ ...formState, isConfirmed: v })}
            aria-label='Confirm Account Inclusion'
          />
        </div>
      )}
    </div>
  )
}
