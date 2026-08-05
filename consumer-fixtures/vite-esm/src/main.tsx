import {
  BalanceSheet,
  BankTransactions,
  ChartOfAccounts,
  type EventCallbacks,
  GlobalMonthPicker,
  Journal,
  LayerProvider,
  LinkedAccounts,
  ProfitAndLoss,
  StatementOfCashFlow,
  Tasks,
} from '@layerfi/components'
import '@layerfi/components/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Referencing the components as values keeps them in the bundle, so `vite build` has to resolve
// every one of their transitive imports out of the tarball. Rendering the data-driven ones would
// only produce network noise; mounting the provider is what exercises the runtime path.
const PUBLIC_COMPONENTS = [
  BalanceSheet,
  BankTransactions,
  ChartOfAccounts,
  Journal,
  LinkedAccounts,
  ProfitAndLoss,
  StatementOfCashFlow,
  Tasks,
]

const eventCallbacks: EventCallbacks = {}

function App() {
  return (
    <LayerProvider
      businessId='00000000-0000-0000-0000-000000000000'
      environment='staging'
      eventCallbacks={eventCallbacks}
    >
      <div data-testid='fixture-ready'>
        {PUBLIC_COMPONENTS.length}
        {' public components resolved'}
      </div>
      <GlobalMonthPicker showLabel />
    </LayerProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
