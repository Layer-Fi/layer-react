import { BigDecimal as BD } from 'effect'

import { type TaxProfile } from '@schemas/taxEstimates/profile'
import { BIG_DECIMAL_ZERO, convertBigDecimalToCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'
import type { TaxProfileForm } from '@components/TaxProfileForm/taxProfileFormSchema'

const centsToBigDecimalOrZero = (value: number | null | undefined): BD.BigDecimal => {
  if (value == null) return BIG_DECIMAL_ZERO
  return convertCentsToBigDecimal(value)
}

const bigDecimalToCentsNullable = (value: BD.BigDecimal | null | undefined): number | null => {
  if (value == null) return null
  return convertBigDecimalToCents(value)
}

const numberToBigDecimalOrZero = (value: number | null | undefined): BD.BigDecimal => {
  if (value == null) return BIG_DECIMAL_ZERO
  return BD.unsafeFromNumber(value)
}

const bigDecimalToNumberNullable = (value: BD.BigDecimal | null | undefined): number | null => {
  if (value == null) return null
  return BD.unsafeToNumber(value)
}

const DEFAULT_TAX_PROFILE_FORM: TaxProfileForm = {
  taxCountryCode: 'US',
  usConfiguration: {
    federal: {
      filingStatus: null,
      annualW2Income: BIG_DECIMAL_ZERO,
      tipIncome: BIG_DECIMAL_ZERO,
      overtimeIncome: BIG_DECIMAL_ZERO,
      withholding: {
        useCustomWithholding: false,
        amount: BIG_DECIMAL_ZERO,
      },
    },
    state: {
      taxState: null,
      filingStatus: null,
      withholding: {
        useCustomWithholding: false,
        amount: BIG_DECIMAL_ZERO,
      },
    },
    deductions: {
      homeOffice: {
        useHomeOfficeDeduction: false,
        homeOfficeArea: BIG_DECIMAL_ZERO,
      },
      vehicle: {
        useMileageDeduction: false,
      },
    },
  },
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
          annualW2Income: centsToBigDecimalOrZero(federal.annualW2Income),
          tipIncome: centsToBigDecimalOrZero(federal.tipIncome),
          overtimeIncome: centsToBigDecimalOrZero(federal.overtimeIncome),
          withholding: federal.withholding
            ? { ...federal.withholding, amount: centsToBigDecimalOrZero(federal.withholding.amount) }
            : null,
        }
        : null,
      state: state
        ? {
          ...state,
          withholding: state.withholding
            ? { ...state.withholding, amount: centsToBigDecimalOrZero(state.withholding.amount) }
            : null,
        }
        : null,
      deductions: deductions
        ? {
          ...deductions,
          homeOffice: deductions.homeOffice
            ? { ...deductions.homeOffice, homeOfficeArea: numberToBigDecimalOrZero(deductions.homeOffice.homeOfficeArea) }
            : null,
        }
        : null,
    },
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
          annualW2Income: bigDecimalToCentsNullable(federal.annualW2Income),
          tipIncome: bigDecimalToCentsNullable(federal.tipIncome),
          overtimeIncome: bigDecimalToCentsNullable(federal.overtimeIncome),
          withholding: federal.withholding
            ? { ...federal.withholding, amount: bigDecimalToCentsNullable(federal.withholding.amount) }
            : null,
        }
        : null,
      state: state
        ? {
          ...state,
          withholding: state.withholding
            ? { ...state.withholding, amount: bigDecimalToCentsNullable(state.withholding.amount) }
            : null,
        }
        : null,
      deductions: deductions
        ? {
          ...deductions,
          homeOffice: deductions.homeOffice
            ? { ...deductions.homeOffice, homeOfficeArea: bigDecimalToNumberNullable(deductions.homeOffice.homeOfficeArea) }
            : null,
        }
        : null,
    },
  }
}
