import { type Overview } from '@schemas/overview/overview'
import { CardType, type Card } from '@schemas/overview/card'

import { makeBusiness } from '@fixtures/business/mocks'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const profitAndLossCard: Card = {
    id: "1",
    cardType: CardType.ProfitAndLoss,
    title: "Profit and Loss",
    numColumns: 1,
    cardProps: {

    }
}

const expensesCard: Card = {
    id: "2",
    cardType: CardType.Expenses,
    title: "Expenses",
    numColumns: 1,
    cardProps: {
        
    }
}

const taxSummaryCard: Card = {
    id: "3",
    cardType: CardType.TaxSummary,
    title: "Tax Summary",
    numColumns: 2,
    cardProps: {
        
    }
}
const mileageCard: Card = {
    id: "4",
    cardType: CardType.Mileage,
    title: "Mileage Tracking",
    numColumns: 1,
    cardProps: {
        
    }
}

const overview: Overview = {
  id: '00000000-0000-4000-8000-000000000401',
  businessId: makeBusiness().id,
  title: "Title",
  showBookKeeping: true,
  cards: [
    profitAndLossCard,
    expensesCard,
    taxSummaryCard,
    mileageCard,
  ],
  // Placeholder props
  slotProps: false,
  bannerProps: "solopreneur"
}

export const { make: makeOverview } =
  createFixtureFactory(overview)
