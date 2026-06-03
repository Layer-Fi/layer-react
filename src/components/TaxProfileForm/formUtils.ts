import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'

import {
  convertCentsToNonRecursiveBigDecimal,
  convertNonRecursiveBigDecimalToCents,
  fromNonRecursiveBigDecimal,
  type NonRecursiveBigDecimal,
  NRBD_ZERO,
  toNonRecursiveBigDecimal,
} from '@schemas/nonRecursiveBigDecimal'
import { type TaxProfile } from '@schemas/taxEstimates/profile'
import type { AppForm } from '@hooks/features/forms/useForm'
import type { TaxProfileForm } from '@components/TaxProfileForm/taxProfileFormSchema'

export type TaxProfileFormSectionProps = {
  form: AppForm<TaxProfileForm>
  isReadOnly?: boolean
  isDesktop: boolean
}

export const getFormFieldProps = (isDesktop: boolean) => isDesktop
  ? {
    className: 'Layer__TaxProfileForm__Field--desktop',
    inline: true,
  }
  : {}

const centsToNrbdOrZero = (value: number | null | undefined): NonRecursiveBigDecimal =>
  value == null ? NRBD_ZERO : convertCentsToNonRecursiveBigDecimal(value)

const nrbdToCentsNullable = (value: NonRecursiveBigDecimal | null | undefined): number | null =>
  value == null ? null : convertNonRecursiveBigDecimalToCents(value)

const numberToNrbdOrZero = (value: number | null | undefined): NonRecursiveBigDecimal =>
  value == null ? NRBD_ZERO : toNonRecursiveBigDecimal(BD.unsafeFromNumber(value))

const nrbdToNumberNullable = (value: NonRecursiveBigDecimal | null | undefined): number | null =>
  value == null ? null : BD.unsafeToNumber(fromNonRecursiveBigDecimal(value))

const DEFAULT_TAX_PROFILE_FORM: TaxProfileForm = {
  taxCountryCode: 'US',
  usConfiguration: {
    federal: {
      filingStatus: null,
      annualW2Income: NRBD_ZERO,
      tipIncome: NRBD_ZERO,
      overtimeIncome: NRBD_ZERO,
      withholding: {
        useCustomWithholding: false,
        amount: NRBD_ZERO,
      },
    },
    state: {
      taxState: null,
      filingStatus: null,
      withholding: {
        useCustomWithholding: false,
        amount: NRBD_ZERO,
      },
    },
    deductions: {
      homeOffice: {
        useHomeOfficeDeduction: false,
        homeOfficeArea: NRBD_ZERO,
      },
      vehicle: {
        useMileageDeduction: false,
      },
    },
  },
  acknowledgedDisclaimer: false,
}

export const taxProfileToFormValues = (taxProfile?: TaxProfile | null): TaxProfileForm => {
  if (!taxProfile) {
    return DEFAULT_TAX_PROFILE_FORM
  }

  const { federal, state, deductions } = taxProfile.usConfiguration ?? {}

  return {
    taxCountryCode: taxProfile.taxCountryCode,
    usConfiguration: {
      federal: federal
        ? {
          ...federal,
          annualW2Income: centsToNrbdOrZero(federal.annualW2Income),
          tipIncome: centsToNrbdOrZero(federal.tipIncome),
          overtimeIncome: centsToNrbdOrZero(federal.overtimeIncome),
          withholding: federal.withholding
            ? { ...federal.withholding, amount: centsToNrbdOrZero(federal.withholding.amount) }
            : null,
        }
        : null,
      state: state
        ? {
          ...state,
          withholding: state.withholding
            ? { ...state.withholding, amount: centsToNrbdOrZero(state.withholding.amount) }
            : null,
        }
        : null,
      deductions: deductions
        ? {
          ...deductions,
          homeOffice: deductions.homeOffice
            ? { ...deductions.homeOffice, homeOfficeArea: numberToNrbdOrZero(deductions.homeOffice.homeOfficeArea) }
            : null,
        }
        : null,
    },
    acknowledgedDisclaimer: taxProfile.userHasSavedTaxProfile ?? false,
  }
}

export const formValuesToTaxProfile = (form: TaxProfileForm): TaxProfile => {
  const { federal, state, deductions } = form.usConfiguration ?? {}

  return {
    userHasSavedTaxProfile: true,
    taxCountryCode: form.taxCountryCode,
    usConfiguration: {
      federal: federal
        ? {
          ...federal,
          annualW2Income: nrbdToCentsNullable(federal.annualW2Income),
          tipIncome: nrbdToCentsNullable(federal.tipIncome),
          overtimeIncome: nrbdToCentsNullable(federal.overtimeIncome),
          withholding: federal.withholding
            ? { ...federal.withholding, amount: nrbdToCentsNullable(federal.withholding.amount) }
            : null,
        }
        : null,
      state: state
        ? {
          ...state,
          withholding: state.withholding
            ? { ...state.withholding, amount: nrbdToCentsNullable(state.withholding.amount) }
            : null,
        }
        : null,
      deductions: deductions
        ? {
          ...deductions,
          homeOffice: deductions.homeOffice
            ? { ...deductions.homeOffice, homeOfficeArea: nrbdToNumberNullable(deductions.homeOffice.homeOfficeArea) }
            : null,
        }
        : null,
    },
  }
}

export function validateTaxProfileForm({ value }: { value: TaxProfileForm }, t: TFunction) {
  const errors: Array<Record<string, string>> = []

  if (!value.acknowledgedDisclaimer) {
    errors.push({ acknowledgedDisclaimer: t('taxEstimates:error.disclaimer_required', 'You must acknowledge the disclaimer to continue.') })
  }

  return errors.length > 0 ? errors : null
}
