import { Text, TextSize } from '../../Typography/Text'
import { ErrorText } from '../../Typography/ErrorText'
import { InputGroup } from '../../Input/InputGroup'
import { useMemo } from 'react'
import { LinkedAccount } from '../../../types/linked_accounts'
import InstitutionIcon from '../../../icons/InstitutionIcon'
import { Checkbox } from '../../ui/Checkbox/Checkbox'
import { AmountInput } from '../../Input/AmountInput'
import { DeprecatedDatePicker } from '../../DeprecatedDatePicker/DeprecatedDatePicker'
import { isEqual, startOfDay } from 'date-fns'
import CheckCircle from '../../../icons/CheckCircle'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import './accountFormBox.scss'

export type AccountFormBoxData = {
  account: LinkedAccount
  isConfirmed: boolean
  openingDate?: Date
  openingBalance?: string
  saved?: boolean
}

type AccountFormProps = {
  account: LinkedAccount
  value: AccountFormBoxData
  isSaved?: boolean
  disableConfirmExclude?: boolean
  errors?: string[]
  onChange: (value: AccountFormBoxData) => void
}

const CLASS_NAME = 'Layer__caobfb'

export const AccountFormBox = ({
  account,
  value,
  isSaved = false,
  disableConfirmExclude = false,
  onChange,
  errors = [],
}: AccountFormProps) => {
  const dataProps = useMemo(() => (
    toDataProperties({
      saved: isSaved,
      confirmed: value.isConfirmed,
    })
  ), [isSaved, value.isConfirmed])

  return (
    <div {...dataProps} className={CLASS_NAME}>
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
            <DeprecatedDatePicker
              displayMode='dayPicker'
              onChange={(v) => {
                if (!value.openingDate || !isEqual(value.openingDate, v as Date)) {
                  onChange({ ...value, openingDate: (v as Date) })
                }
              }}
              selected={value.openingDate ?? startOfDay(new Date())}
              currentDateOption={false}
              disabled={!disableConfirmExclude && !value.isConfirmed}
            />
          </InputGroup>
          <InputGroup label='Opening balance'>
            <AmountInput
              name='openingBalance'
              defaultValue={value.openingBalance}
              onChange={newValue =>
                onChange({ ...value, openingBalance: newValue })}
              disabled={!disableConfirmExclude && !value.isConfirmed}
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
            size='lg'
            isSelected={value.isConfirmed}
            onChange={v => onChange({ ...value, isConfirmed: v })}
            aria-label='Confirm Account Inclusion'
          />
        </div>
      )}
      <div className={`${CLASS_NAME}__success-banner`}>
        <CheckCircle size={36} />
      </div>
    </div>
  )
}
