const baseValues = {
  year: '2025',
  businessIncome: 28964.00,
  deductibleExpenses: 12901.00,
  deductibleMileage: 0.00,
  selfEmploymentDeduction: 215.10,
  qualifiedTipDeduction: 0.00,
  qualifiedOvertimeDeduction: 0.00,
  federalDeductions: (15750.00 / 216000.00) * 28964.00,
  businessIncomeDeduction: 2518.00,
  federalTaxRate: 0.2071,
  taxableSocialSecurityIncome: 0.00,
  socialSecurityTaxRate: 0.00,
  taxableMedicareIncome: (14835.00 / 216000.00) * 28964.00,
  medicareTaxRate: 0.029,
  federalTaxesPaid: 150.00,
  stateTaxesPaid: 0.00,
  stateDeductions: (5540.00 / 216000.00) * 28964.00,
  stateTaxRate: 0.0759,
  taxesDueDate: new Date('2026-04-15'),
  quarterlyEstimates: [
    { quarter: 'Q1', amount: 945.52 },
    { quarter: 'Q2', amount: 6654.00 },
    { quarter: 'Q3', amount: 4649.00 },
    { quarter: 'Q4', amount: 6199.00 },
  ],
  quarterlyPayments: [
    { quarter: 'Q1', amount: 150.00 },
    { quarter: 'Q2', amount: 0 },
    { quarter: 'Q3', amount: 0 },
    { quarter: 'Q4', amount: 0 },
  ],
}

const adjustedGrossIncome = baseValues.businessIncome
  - baseValues.deductibleExpenses
  - baseValues.deductibleMileage
  - baseValues.selfEmploymentDeduction
  - baseValues.qualifiedTipDeduction
  - baseValues.qualifiedOvertimeDeduction
const taxableIncome = adjustedGrossIncome - baseValues.federalDeductions - baseValues.businessIncomeDeduction
const federalTaxEstimate = taxableIncome * baseValues.federalTaxRate
const socialSecurityTaxEstimate = baseValues.taxableSocialSecurityIncome * baseValues.socialSecurityTaxRate
const medicareTaxEstimate = baseValues.taxableMedicareIncome * baseValues.medicareTaxRate
const federalTaxesOwed = federalTaxEstimate + socialSecurityTaxEstimate + medicareTaxEstimate
const stateTaxableIncome = adjustedGrossIncome - baseValues.stateDeductions
const stateTaxEstimate = stateTaxableIncome * baseValues.stateTaxRate
const stateTaxesOwed = stateTaxEstimate
const projectedTaxesOwed = federalTaxesOwed + stateTaxesOwed

export const taxEstimateDefaults = {
  ...baseValues,
  adjustedGrossIncome,
  taxableIncome,
  federalTaxEstimate,
  socialSecurityTaxEstimate,
  medicareTaxEstimate,
  federalTaxesOwed,
  stateTaxableIncome,
  stateTaxEstimate,
  stateTaxesOwed,
  projectedTaxesOwed,
}
