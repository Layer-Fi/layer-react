import React from 'react'
import { LinkedAccount } from '../../../types/linked_accounts'
import InstitutionIcon from '../../../icons/InstitutionIcon'
import { Text, TextSize } from '../../Typography'
import { InputGroup } from '../../Input'
import { AmountInput } from '../../Input/AmountInput'
import { DatePicker } from '../../DatePicker'
import { isEqual } from 'date-fns'
import { dollarsToCents, centsToDollarsWithoutCommas } from '../../../models/Money'

export type AccountFormBoxData = {
  openingDate: Date
  openingBalance: number | null
}

type AccountFormProps = {
  account: LinkedAccount
  value: AccountFormBoxData
  onChange: (newValue: AccountFormBoxData) => void
}

const CLASS_NAME = 'Layer__caobfb'

export const AccountFormBox = ({
  account,
  value,
  onChange,
}: AccountFormProps) => {
  const { openingDate, openingBalance } = value

  return (
    <div className={CLASS_NAME}>
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
                if (!openingDate || !isEqual(openingDate, v as Date)) {
                  onChange({ ...value, openingDate: (v as Date) })
                }
              }}
              selected={openingDate}
              currentDateOption={false}
            />
          </InputGroup>
          <InputGroup label='Opening balance'>
            <AmountInput
              name='openingBalance'
              value={openingBalance === null
                ? undefined
                : centsToDollarsWithoutCommas(openingBalance)}
              onChange={balanceAsString =>
                onChange({
                  ...value,
                  openingBalance: balanceAsString === undefined
                    ? null
                    : dollarsToCents(balanceAsString),
                })}
            />
          </InputGroup>
        </div>
      </div>
    </div>
  )
}
