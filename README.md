# Layer Financial React Components

This is a Javascript library that provides easy access to Layer Financial's
acounting offering through React components.

<br />

## Installation

```
npm install --save @layerfi/components
```

or

```
yarn install @layerfi/components
```

<br />

## Usage

Nest the components you want to use under the `LayerProvider` component. You
need to provide the component with a few props, though:

- `appId` Your appId
- `appSecret` A secret for signing in to Layer
- `businessId` The ID of the business whose infomation you're showing.
- `clientId` The ID of the application you're writing
- `envronment` (Optional, defaults to "production") the Layer environment you're
  attempting to access ["staging" or "production"]
- `theme` (Optional) to customize the look of components

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

<br />
<br />

## Components

### Bank Transactions

```
import { BankTransactions } from "@layerfi/components";
…
<BankTransactions />
```

<br />

### Profit And Loss

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

<br />

### Balance Sheet

```
import { BalanceSheet } from "@layerfi/components";
…
<BalanceSheet/>
```

<br />
<br />

## Styling

Components can be customized:

- using `theme` attribute of `LayerProvider`,
- setting CSS variables,
- overwriting CSS classes.

<br />

### Using `theme` attribute

```ts
<LayerProvider
  businessId="..."
  environment="..."
  appId="..."
  clientId="..."
  appSecret="..."
  theme={{
    colors: {
      // Base colors:
      dark: { h: '28', s: '26%', l: '11%' },
      light: { h: '52', s: '100%', l: '55%' },
    },
  }}
>
  {...}
</LayerProvider>
```

The `colors` can be defined in `HSL`, `RGB` or `HEX`:

```
// HSL:
colors: {
  dark: { h: '28', s: '26%', l: '11%' },
  light: { h: '52', s: '100%', l: '55%' },
},

// RGB:
colors: {
  dark: { r: '36', g: '28', b: '21' },
  light: { r: '255', g: '224', b: '27' },
},

// HEX:
colors: {
  dark: { hex: '#241C15' },
  light: { hex: '#FFE01B' },
},
```

<br />

### CSS variables

```css
body .Layer__component {
  --color-dark-h: 167;
  --color-dark-s: 38%;
  --color-dark-l: 15%;

  --text-color-primary: #333;
}
```

See [`variables.scss`](https://github.com/Layer-Fi/layer-react/blob/main/src/styles/variables.scss) to find more CSS variables available to customize.

<br />

### CSS classes

For example:

```css
body .Layer__table-cell-content {
  background: white;
}

body .Layer__bank-transaction-row .Layer__table-cell-content {
  background: gray;
}
```
