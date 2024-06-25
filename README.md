# Layer Financial React Components

Layer's embeddable React component library provides an out of the box accounting experience. This project emphasizes composability and brandability, allowing you to

1. Use full page layouts we've already tested and used _or_ layout individual components however you choose.
2. Brand components with your company colors, fonts, and more.

All you need to get started is sandbox development credentials - reach out [here](https://www.layerfi.com/#contact-sale) if you don't have those yet!

#### Related links

- Layer home: https://www.layerfi.com
- Documentation: https://docs.layerfi.com/introduction
- NPM: https://www.npmjs.com/package/@layerfi/components

<br />

## Installation

```ts
npm install --save @layerfi/components
```

or

```ts
yarn install @layerfi/components
```

## Usage

Nest the components you want to use under the `LayerProvider` component. You should provide the component with a few props:

- `businessId` The ID of the business whose infomation you're showing.
- `businessAccessToken` Temporary authentication token scoped to this specific business. See the [getting started guide](https://docs.layerfi.com/guides/embedded-components#backend-setup) for how to fetch these tokens on your backend.
- `envronment` (Optional, defaults to "production") the Layer environment you're attempting to access [`staging` or `production`]
- `theme` (Optional) to customize the look of components

```tsx
import { LayerProvider } from "@layerfi/components";
...
<LayerProvider
  businesId="..."
  businessAccessToken="..."
  environment={'staging'}
>
  {...}
</LayerProvider>
```

#### Development

In development, it's often convenient to avoid fetching business-scoped tokens. You may find it more convenient to set your sandbox `clientId` and `clientSecret` directly, which will give you access to any business in your sandbox account.

```tsx
import { LayerProvider } from "@layerfi/components";
...
<LayerProvider
  businesId="..."
  appId="..."
  appSecret="..."
  environment={'staging'}
>
  {...}
</LayerProvider>
```

<br />

## Components

### Onboarding

The onboarding component can be included on an accounting landing page to prompt users to connect accounts.
![Onboarding landing state](https://github.com/Layer-Fi/layer-react/assets/1592431/1fef5910-3a6f-41d8-9600-a66b07ccfc33)

After connecting accounts, the component will change into a prompt to categorize transactions.
![Onboarding after linking](https://github.com/Layer-Fi/layer-react/assets/1592431/4b7d5711-f1da-42cb-8105-e0489f7431ad)

For a business that has already onboarded, this component will render nothing, so it's safe to leave on the default page for all businesses.

```tsx
<Onboarding onTransactionsToReviewClick={onTransactionsToReviewClick} />
```

This component has one primary prop: `onTransactionsToReviewClick` should be a function which navigates to the bank transactions to review page. For example, if the bank transaction categorizaiton page lives on `/account/bank-transactions` within your app:

```tsx
<Onboarding
  onTransactionsToReviewClick={() => navigate('/accounting/bank-transactions')}
/>
```

This prop is a function, so you can use your app's standard strategy for navigation.

### Bank Accounts & Transactions

#### Linked Accounts

Displays all accounts connected to Layer including embedded banking, Plaid, and custom accounts.

![Linked Accounts](https://github.com/Layer-Fi/layer-react/assets/1592431/3e7c1349-a5c3-47c8-a4d5-71f9bdc3be78)

```tsx
<LinkedAccounts
  elevated={elevatedLinkedAccounts}
  showLedgerBalance={showLedgerBalance}
/>
```

Props:

- `asWidget`: Minimized version of the component
- `elevated`: Stylistic option to highlight component
- `showLedgerBalance`: Flag to enable or hide the current ledger balance corresponding to this external account. Useful for reconciliation.

#### Transaction categorization

The transaction categorization component handles displaying both categorized transactions and the workflow for categorizing new transactions as they are imported into Layer.

![TransactionCategorization](https://github.com/Layer-Fi/layer-react/assets/1592431/c1fea59b-a4c3-4d53-bfc9-9126c5ecba4a)

```tsx
<BankTransactions asWidget />
```

Optional properties and `useBankTransactionsContext` give more control over the transactions list:

```tsx
/** Using props */
<BankTransactions
  filters={{
    amount: { min: 0, max: 100 },
  }}
/>

/** Using hook */
const { setFilters } = useBankTransactionsContext()

setFilters({ amount: { min: 0, max: 10000 } })

<BankTransactions />
```

### Reporting

#### Profit And Loss Chart

![Profit and Loss chart](https://github.com/Layer-Fi/layer-react/assets/1592431/34e36b1b-024b-4598-b23b-dff723b2659c)

```tsx
import { ProfitAndLoss } from "@layerfi/components";
…
<ProfitAndLoss>
  <ProfitAndLoss.Chart />
  <ProfitAndLoss.Summaries />
  <ProfitAndLoss.DatePicker />
  <ProfitAndLoss.Table />
</ProfitAndLoss>
```

#### Profit and Loss Summary Cards

![](https://github.com/Layer-Fi/layer-react/assets/1592431/06459f20-519e-4413-80ba-fb9965c32f9f)

```tsx
import { ProfitAndLoss } from "@layerfi/components";
…
<ProfitAndLoss>
  <div className='Layer__accounting-overview__summaries-row'>
    <ProfitAndLoss.Summaries actionable={false} />
    <TransactionToReviewCard onClick={onTransactionsToReviewClick} />
  </div>
</ProfitAndLoss>
```

Props:

- `actionable`: enables or disables whether clicking the revenue & expense charts open the P&L sidebar view.
- `vertical`: changes the card layout to be vertically stacked instead of horizontal
- `revenueLabel`: specifiable label for revenue for uses where you prefer 'income' or other another term.

Note that the `<TransactionToReviewCard>` is a separate component, but is meant to be optionally bundled with the summary cards. As with the onboarding component, this component has one primary prop: `onTransactionsToReviewClick` should be a function which navigates to the bank transactions to review page. For example, if the bank transaction categorizaiton page lives on `/account/bank-transactions` within your app:

```tsx
<Onboarding
  onTransactionsToReviewClick={() => navigate('/accounting/bank-transactions')}
/>
```

#### Profit and Loss Table

![Profit And Loss Table](https://github.com/Layer-Fi/layer-react/assets/1592431/8bca34d1-6357-4030-811a-e46fe1f83195)

```tsx
import { ProfitAndLoss } from "@layerfi/components";
…
<ProfitAndLoss>
  <ProfitAndLoss.Table>
</ProfitAndLoss>
```

The P&L table supports one optional prop:

- `lockExpanded` forces the table to be fully expanded showing all rows

#### Balance Sheet

![Balance Sheet](https://github.com/Layer-Fi/layer-react/assets/1592431/c35a6110-38e3-4845-b725-b1ca4913b831)

The Balance Sheet component displays an interactive table. A default date can be passed in via the `effectiveDate` prop.

### Ledger

#### Chart of Accounts

![Chart of Accounts](https://github.com/Layer-Fi/layer-react/assets/1592431/05405344-81de-4d76-b835-633e247cdeb9)

The chart of accounts gives direct read and write access into the double entry general ledger underlying Layer's data. It exposes the list of accounts and enables users to create new accounts.

```tsx
<ChartOfAccounts asWidget withDateControl withExpandAllButton />
```

The following props are supported

- `asWidget`: Displays a more compact version.
- `withDateControl`: Includes a date picker which determines the effective date of account balances displayed.
- `withExpandAllButton`: Optionally displays a button to expand and collapse all sub account lists.

#### Journal

![Journal](https://github.com/Layer-Fi/layer-react/assets/1592431/52ed02c7-a73a-4a68-9eac-1ede16633afc)

The Journal component displays the full history of journal entries and allows users to create journal entries by hand as well.

A sidebar expands to display details about the invoice.

![Journal sidebar](https://github.com/Layer-Fi/layer-react/assets/1592431/f9c14a59-aeec-4716-bd10-98903b221c44)

```tsx
<Journal />
```

The follow props are supported:

- `asWidget`: Compact version

## Styling

You have a range of options for custom styling. In order of most simple to most control:

1. Using the `theme` attribute of `LayerProvider`,
2. Setting CSS variables,
3. Overwriting CSS classes.

### Using `theme` attribute

The theme attribute allows you to set parimary light and dark colors. The component will then use your primary colors to create a cohesive color palette across all components. We won't add any new colors, just different lightness of your brand colors for accents where helpful, e.g. hover states.

```ts
<LayerProvider
  businessId="..."
  environment="..."
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

```tsx
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

### CSS variables

```css
body .Layer__component {
  --color-dark-h: 167;
  --color-dark-s: 38%;
  --color-dark-l: 15%;

  --text-color-primary: #333;
}
```

The full list of variables is listed in the [`variables.css`](https://github.com/Layer-Fi/layer-react/blob/main/src/styles/variables.scss) file and contains:

```scss
// 1. BASE VARIABLES:
--color-black: #1a1a1a;
--color-white: white;

--color-info-success: hsl(145, 45%, 42%);
--color-info-success-bg: hsl(145, 59%, 86%);
--color-info-success-fg: hsl(145, 63%, 29%);

--color-info-warning: hsl(43, 100%, 44%);
--color-info-warning-bg: hsl(43, 100%, 84%);
--color-info-warning-fg: hsl(43, 88%, 26%);

--color-info-error: hsl(0 76% 50%);
--color-info-error-bg: hsl(0 83% 86%);
--color-info-error-fg: hsl(0 88% 32%);

--color-dark-h: 0;
--color-dark-s: 0%;
--color-dark-l: 7%;
--color-dark: hsl(var(--color-dark-h) var(--color-dark-s) var(--color-dark-l));

--color-light-h: 0;
--color-light-s: 0%;
--color-light-l: 90%;
--color-light: hsl(
  var(--color-light-h) var(--color-light-s) var(--color-light-l)
);

--color-base-0: #fff;
--color-base-50: hsl(var(--color-dark-h) 1% 98%);
--color-base-100: hsl(var(--color-dark-h) 1% 96%);
--color-base-200: hsl(var(--color-dark-h) 1% 94%);
--color-base-300: hsl(var(--color-dark-h) 2% 92%);
--color-base-400: var(--color-light);
--color-base-500: hsl(var(--color-dark-h) 2% 53%);
--color-base-600: hsl(var(--color-dark-h) 7% 40%);
--color-base-700: hsl(var(--color-dark-h) 9% 27%);
--color-base-800: hsl(var(--color-dark-h) 12% 20%);
--color-base-900: var(--color-dark);
--color-base-1000: hsl(var(--color-dark-h) 20% 7%);

--max-component-width: 1408px;

--base-transparent-1: hsla(220, 43%, 11%, 0.01);

--base-transparent-2: hsla(220, 43%, 11%, 0.02);

--base-transparent-4: hsla(
  var(--color-dark-h),
  var(--color-dark-s),
  var(--color-dark-l),
  0.04
);
--base-transparent-5: hsla(
  var(--color-dark-h),
  var(--color-dark-s),
  var(--color-dark-l),
  0.05
);
--base-transparent-6: hsla(
  var(--color-dark-h),
  var(--color-dark-s),
  var(--color-dark-l),
  0.06
);
--base-transparent-8: hsla(
  var(--color-dark-h),
  var(--color-dark-s),
  var(--color-dark-l),
  0.08
);
--base-transparent-10: hsla(
  var(--color-dark-h),
  var(--color-dark-s),
  var(--color-dark-l),
  0.1
);
--base-transparent-12: hsla(
  var(--color-dark-h),
  var(--color-dark-s),
  var(--color-dark-l),
  0.12
);

// 2. BASE CUSTOMIZATION
--color-primary: var(--color-dark);
--color-accent: var(--color-light);
--color-secondary: var(--color-base);
--color-success: var(--color-info-success);
--color-danger: var(--color-info-error);
--color-danger-dark: hsl(349, 30%, 30%);
--color-danger-light: hsla(
  var(--color-info-error-h),
  var(--color-info-error-s),
  var(--color-info-error-l),
  0.4
);
--text-color-primary: var(--color-dark);
--text-color-secondary: var(--color-base-600);
--bg-element-focus: var(--color-base-50);

// 3. EXTENDED CUSTOMIZATION
--font-family: 'InterVariable', 'Inter', sans-serif;
--font-family-numeric: 'InterVariable', 'Inter', sans-serif;
--text-xs: 11px;
--text-sm: 12px;
--text-md: 14px;
--text-lg: 16px;
--text-heading: 24px;
--text-heading-sm: 16px;
--font-weight-normal: 460;
--font-weight-bold: 540;
--spacing-4xs: 2px;
--spacing-3xs: 4px;
--spacing-2xs: 6px;
--spacing-xs: 8px;
--spacing-sm: 12px;
--spacing-md: 16px;
--spacing-lm: 20px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 36px;
--spacing-3xl: 40px;
--spacing-5xl: 52px;
--bg-color: var(--color-white);
--border-color: var(--color-base-200);
--border-radius-4xs: 2px;
--border-radius-3xs: 4px;
--border-radius-2xs: 6px;
--border-radius-xs: 8px;
--border-radius-sm: 12px;
--border-radius: 16px;
--border-radius-5xl: 52px;

--text-color-transaction-credit: var(--color-info-success);
--text-color-varying-amount: var(--color-base-700);

--input-border-radius: var(--border-radius-2xs);
--input-font-size: var(--text-md);
--input-border-color: var(--color-base-300);
--input-placeholder-color: var(--color-base-500);

--label-color: var(--color-base-700);

--btn-font-size: var(--text-md);
--btn-border-radius: var(--border-radius-2xs);
--btn-color: var(--color-black);
--btn-bg-color: var(--color-white);
--btn-color-primary: var(--color-white);
--btn-bg-color-primary: var(--color-black);
--btn-color-hover: var(--color-white);
--btn-bg-color-hover: var(--color-primary);
--btn-color-icon: var(--color-black);
--btn-bg-color-icon: var(--color-base-50);
--btn-color-icon-hover: var(--color-primary);
--btn-bg-color-icon-hover: var(--color-accent);
--btn-secondary-color: var(--color-black);
--btn-secondary-bg-color: var(--color-white);

--badge-color: var(--color-base-900);
--badge-fg-color: var(--color-base-900);
--badge-bg-color: var(--color-base-400);

--badge-color-success: var(--color-info-success);
--badge-fg-color-success: var(--color-info-success-fg);
--badge-bg-color-success: var(--color-info-success-bg);

--badge-color-warning: var(--color-info-warning);
--badge-fg-color-warning: var(--color-info-warning-fg);
--badge-bg-color-warning: var(--color-info-warning-bg);

--badge-color-error: var(--color-info-error);
--badge-fg-color-error: var(--color-info-error-fg);
--badge-bg-color-error: var(--color-info-error-bg);

--badge-border-radius: var(--border-radius-sm);

--table-bg: var(--color-white);

--tooltip-color: var(--color-white);
--tooltip-bg-color: var(--color-base-800);

--bar-color-income: var(--color-base-400);
--bar-color-expenses: var(--color-base-900);

--chart-indicator-color: var(--color-base-700);
```

### CSS classes

For fine grained control, you can override specific classes. We recommend using your browser dev tools to find the component you want restyle and overriding that specific class with a higher priority CSS rule.

```css
body .Layer__table-cell-content {
  background: white;
}

body .Layer__bank-transaction-row .Layer__table-cell-content {
  background: gray;
}
```
