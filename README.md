# Layer Financial React Components

This is a Javascript library that provides easy access to Layer Financial's
acounting offering through React components.

## Installation

```
npm install --save @layerfi/components
```
   or
```
yarn install @layerfi/components
```

## Usage

Nest the components you want to use under the `LayerProvider` component. You
need to provide the component with a few props, though:

* `appId` Your appId
* `appSecret` A secret for signing in to Layer
* `businessId` The ID of the business whose infomation you're showing.
* `clientId` The ID of the application you're writing
* `envronment` (Optional, defaults to "production") the Layer environment you're
  attempting to access ["staging" or "production"]

```
import { LayerProvider } from "@layerfi/components";
...
<LayerProvider
  appId="..."
  appSecret="..."
  businessId="..."
  clientId="..."
>
  {...}
</LayerProvider>
```

## Bank Transactions

```
import { BankTransactions } from "@layerfi/components";
…
<BankTransactions/>
```

## Profit And Loss

You can rearrange the order as you like.

```
import { ProfitAndLoss } from "@layerfi/components";
…
<ProfitAndLoss>
  <ProfitAndLoss.Chart />
  <ProfitAndLoss.Summaries />
  <ProfitAndLoss.DatePicker />
  <ProfitAndLoss.Table />
</ProfitAndLoss>
```

## Balance Sheet

```
import { BalanceSheet } from "@layerfi/components";
…
<BalanceSheet/>
```
