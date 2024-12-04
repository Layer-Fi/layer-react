import { toCanvas } from 'html-to-image'
import { LineItem } from '../../types/line_item'
import { Month, ProfitAndLoss } from '../../types/profit_and_loss'
import jsPDF from 'jspdf'


// Array of year strings from 2023 to the current year
export const YEARS = Array.from(
  { length: (new Date().getFullYear()) - 2023 + 1 },
  (_, i) => (2023 + i).toString()
)

export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
export const MONTH_NAMES: { [key in Month]: string } = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
}

export const STRUCTURES = [
  'DEFAULT',
  'MEDSPA_NO_LICENSING',
  'MEDSPA_PDF',
  'CITRUS',
  'CITRUS_NO_LICENSING',
  'TRUCKING',
] as const

export enum Direction {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

const formatName = (name: string): string => {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
}

export const generatePDF = async (
  pageElements: HTMLElement[],
  businessName: string,
  month: string,
  year: string
) => {
  const pdf = new jsPDF('p', 'pt', 'a4', true)
  const pageWidth = pdf.internal.pageSize.width
  const margin = 0

  for (let i = 0; i < pageElements.length; i++) {
    if (i > 0) {
      pdf.addPage()
    }
    const pageElement = pageElements[i]
    const canvas = await toCanvas(pageElement, {})
    const imgData = canvas.toDataURL('image/svg')
    pdf.addImage(
      imgData,
      'SVG',
      margin, // x
      0, // y
      pageWidth - margin * 2, // w
      0, // h
      undefined,
      'FAST'
    )
  }

  pdf.save(
    `profit-and-loss-${formatName(
      businessName
    )}-${year}-${month.toLocaleLowerCase()}.pdf`
  )
}

export function centsToDollars(cents: number): string {
  const dollars = cents / 100
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

export const getMoM = (priorNumber: number, currentNumber: number): number => {
  if (priorNumber === 0) {
    if (currentNumber > 0) {
      return 100
    } else if (currentNumber < 0) {
      return -100
    } else {
      return NaN
    }
  }

  const delta = Math.abs((Math.round(
    ((currentNumber - priorNumber) / priorNumber) * 100 * 10,
  ) / 10))

  if (currentNumber < priorNumber) {
    return -delta
  } else {
    return delta
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const difference = (array: any[], values: string | any[]) => {
  return array.filter(item => !values.includes(item))
}

/**
 * This ugly function can be deleted once the api is updated to always
 * return all of the PNL values
 */
export const addPlaceHoldersToPNLs = (
  pnl1: ProfitAndLoss,
  pnl2: ProfitAndLoss
): { pnl1: ProfitAndLoss; pnl2: ProfitAndLoss } => {
  const fieldsToPad: { fieldName: string; displayName: string }[] = [
    { fieldName: 'income', displayName: 'Income' },
    { fieldName: 'cost_of_goods_sold', displayName: 'Cost of goods sold' },
    { fieldName: 'expenses', displayName: 'Expenses' },
    { fieldName: 'taxes', displayName: 'Taxes' },
    { fieldName: 'other_outflows', displayName: 'Other Outflows' },
    { fieldName: 'personal_expenses', displayName: 'Personal expenses' },
  ]

  const updatedPnl1 = structuredClone(pnl1)
  const updatedPnl2 = structuredClone(pnl2)

  const missingTopLevelFromPnl1: string[] = []
  const missingTopLevelFromPnl2: string[] = []

  for (const { fieldName } of fieldsToPad) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(pnl1 as any)[fieldName]) {
      missingTopLevelFromPnl1.push(fieldName)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(pnl2 as any)[fieldName]) {
      missingTopLevelFromPnl2.push(fieldName)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pnl1LineItems = ((pnl1 as any)[fieldName]?.line_items || []).map(
      ({ display_name }: LineItem) => display_name
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pnl2LineItems = ((pnl2 as any)[fieldName]?.line_items || []).map(
      ({ display_name }: LineItem) => display_name
    )

    const missingFromPnl1 = difference(pnl2LineItems, pnl1LineItems)
    const missingFromPnl2 = difference(pnl1LineItems, pnl2LineItems)

    for (const missingTopLevel of missingTopLevelFromPnl1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updatedPnl1 as any)[missingTopLevel] = {
        value: 0,
        display_name: fieldsToPad.find(
          (field) => field.fieldName === missingTopLevel
        )?.displayName,
      }
    }
    for (const missingTopLevel of missingTopLevelFromPnl2) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updatedPnl2 as any)[missingTopLevel] = {
        value: 0,
        display_name: fieldsToPad.find(
          (field) => field.fieldName === missingTopLevel
        )?.displayName,
      }
    }

    for (const missing of missingFromPnl1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updatedPnl1 as any)[fieldName].line_items?.push({
        value: 0,
        display_name: missing,
      })
    }
    for (const missing of missingFromPnl2) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updatedPnl2 as any)[fieldName].line_items?.push({
        value: 0,
        display_name: missing,
      })
    }
  }

  return { pnl1: updatedPnl1, pnl2: updatedPnl2 }
}
