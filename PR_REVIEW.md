# Code Review: Tax Payments Expandable Table

## Overview
This PR successfully implements expandable rows for the Tax Payments table, addressing the integration bug where only federal taxes were displayed. The implementation now shows a breakdown of federal income + self-employment taxes and state taxes when rows are expanded.

## ✅ Strengths

### 1. **Excellent Problem Solving**
- Successfully fixed the bug where only federal taxes were shown in the aggregate
- The expandable rows provide clear visibility into tax composition
- Handles uncategorized payments gracefully with conditional rendering

### 2. **Clean Architecture**
- Good separation of concerns with `ExpandableDataTable` and `ExpandableDataTableProvider`
- Reusable `ExpandButton` component with proper rotation animation
- Well-structured data transformation in `getTableRows`

### 3. **Proper State Management**
- Correctly calculates cumulative rolled-over amounts for federal and state separately
- Maintains proper state through `ExpandableDataTableProvider` context
- Good use of `useMemo` to prevent unnecessary recalculations

### 4. **Accessibility Improvements**
- `ExpandButton` has proper `aria-label` for expand/collapse states
- Maintains `isRowHeader` for the Quarter column
- Uses semantic button elements for expandable cells

### 5. **Mobile Fix**
- Fixed the inconsistent hook calls issue by restructuring the component to use `useMemo` for slots
- Proper conditional rendering prevents React hook violations

### 6. **Internationalization**
- All new labels properly use i18n with fallback text
- Added translations for both en-US and fr-CA

## 🔍 Issues & Suggestions

### 1. **Critical: Rollover Calculation Logic**

**Location:** `TaxPaymentsTable.tsx` lines 134-187

The rollover calculation appears to have a potential issue. The cumulative taxes owed for each quarter should be:
```
cumulativeTaxesOwed = rolledOverFromPrevious + estimated
```

However, in the current implementation:
- For parent rows: `cumulativeTaxesOwed: payment.owedRolledOverFromPrevious + payment.owedThisQuarter` ✅ Correct
- For federal/state subrows: `cumulativeTaxesOwed: previousFederalRolledOver + federalEstimated` ✅ Correct

But the rollover for the **next** quarter is calculated as:
```typescript
previousFederalRolledOver = federalCumulativeTaxesOwed - federalPaid
```

This is correct IF `federalCumulativeTaxesOwed` represents the total owed up to that point. However, I need to verify this matches the backend's `owedRolledOverFromPrevious` calculation.

**Question:** Does the backend's `owedRolledOverFromPrevious` for Q2 equal `(Q1's owedRolledOverFromPrevious + Q1's owedThisQuarter - Q1's totalPaid)`? If so, the calculation is correct. If not, there may be a discrepancy.

### 2. **Accessibility: Expandable Row Interaction**

**Location:** `TaxPaymentsTable.tsx` lines 43-64

The current implementation wraps each cell in a button when the row is expandable. This creates multiple clickable areas per row, which could be confusing.

**Issues:**
- Multiple buttons per row (5 buttons for 5 columns) all doing the same thing
- Screen reader users will hear "button" announced for each cell
- The visual indication (chevron) is only in the first column, but all cells are clickable

**Suggestions:**
1. Consider making only the first column (Quarter) clickable as a button
2. For other columns, use CSS to show pointer cursor but keep them as regular cells
3. Add a visual indicator (like hover background) to show the entire row is expandable

**Alternative approach:**
```typescript
// Only make the first column a button, others just show content
const renderExpandableCell = ({
  row,
  children,
  alignEnd = false,
  isFirstColumn = false,
}: {
  row: TaxPaymentRowType
  children: ReactNode
  alignEnd?: boolean
  isFirstColumn?: boolean
}) => {
  if (!row.getCanExpand() || !isFirstColumn) {
    return children
  }

  return (
    <button
      type='button'
      className={getCellButtonClassName(alignEnd)}
      onClick={() => row.toggleExpanded()}
    >
      {children}
    </button>
  )
}
```

### 3. **Styling: Button Appearance**

**Location:** `taxPaymentsTable.scss` lines 28-40

The button styling removes all default button styles, which is good, but consider adding:
- Focus visible styles for keyboard navigation
- Hover state to indicate interactivity
- Active state for click feedback

**Suggestion:**
```scss
.Layer__TaxPaymentsTable__RowToggleButton {
  display: flex;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;

  &:hover {
    background-color: var(--color-base-50); // or appropriate hover color
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  &--alignEnd {
    justify-content: flex-end;
  }
}
```

### 4. **Code Duplication in Column Config**

**Location:** `TaxPaymentsTable.tsx` lines 67-123

All columns except the first one have identical structure with `renderExpandableCell` wrapping `MoneySpan` with `alignEnd: true`.

**Suggestion:** Create a helper function to reduce duplication:
```typescript
const createMoneyColumn = (
  id: TaxPaymentColumns,
  headerKey: string,
  headerFallback: string,
  getValue: (row: TaxPaymentTableRow) => number,
  t: TFunction,
): LeafColumn<TaxPaymentTableRow> => ({
  id,
  header: t(headerKey, headerFallback),
  cell: (row: TaxPaymentRowType) => (
    renderExpandableCell({
      row,
      alignEnd: true,
      children: <MoneySpan amount={getValue(row.original)} />,
    })
  ),
})
```

### 5. **Missing Type Safety**

**Location:** `TaxPaymentsTable.tsx` line 173

The conditional spread for uncategorized payments could benefit from better type safety:

**Current:**
```typescript
...(payment.totalPaidBreakdown.uncategorized !== 0 ? [{ ... }] : [])
```

**Suggestion:** Extract to a helper function:
```typescript
const getUncategorizedRow = (
  payment: TaxPaymentQuarterWithId,
  t: TFunction,
): TaxPaymentTableRow[] => {
  if (payment.totalPaidBreakdown.uncategorized === 0) {
    return []
  }
  
  return [{
    id: `${payment.id}-uncategorized`,
    label: t('taxEstimates:label.uncategorized_tax_payment', 'Uncategorized Tax Payment'),
    rolledOverFromPreviousQuarter: 0,
    cumulativeTaxesOwed: 0,
    estimated: 0,
    paid: payment.totalPaidBreakdown.uncategorized,
  }]
}
```

### 6. **Performance: Dependencies Array**

**Location:** `ExpandableDataTable.tsx` line 100

```typescript
const dependencies = useMemo(() => [expanded], [expanded])
```

This creates a new array on every render when `expanded` changes. Consider:
```typescript
const dependencies = [expanded]
```

The `useMemo` here doesn't provide value since it's creating a new array anyway.

### 7. **Potential Issue: Empty Subrows**

**Location:** `TaxPaymentsTable.tsx` lines 153-183

What happens if both federal and state taxes are 0, and there's no uncategorized payment? The row would have an empty `subRows` array, but the chevron would still show because `row.getCanExpand()` might return true.

**Suggestion:** Add validation:
```typescript
const subRows = [
  // ... federal and state rows
  ...getUncategorizedRow(payment, t)
].filter(row => 
  row.paid !== 0 || 
  row.estimated !== 0 || 
  row.rolledOverFromPreviousQuarter !== 0
)

const row: TaxPaymentTableRow = {
  // ...
  subRows: subRows.length > 0 ? subRows : undefined,
}
```

## 📝 Minor Observations

### 1. **Consistent Naming**
The column enum uses `RolledOverFromPrevious` but the data field is `rolledOverFromPreviousQuarter`. Consider aligning these for consistency.

### 2. **Magic Numbers**
**Location:** `ExpandableDataTable.tsx` line 32
```typescript
paddingInlineStart: depth * 20 + (canExpand ? 0 : 4),
```
Consider extracting `20` and `4` as named constants:
```typescript
const INDENT_PER_LEVEL = 20
const LEAF_NODE_OFFSET = 4
```

### 3. **Documentation**
Consider adding JSDoc comments for:
- `getTableRows` function explaining the rollover calculation logic
- `renderExpandableCell` explaining why all cells are clickable
- The cumulative calculation algorithm

## 🧪 Testing Recommendations

1. **Test rollover calculations** with various scenarios:
   - Quarter with no payments
   - Quarter with only federal or only state taxes
   - Quarter with uncategorized payments
   - Verify cumulative amounts match expectations

2. **Test accessibility**:
   - Keyboard navigation (Tab, Enter, Space)
   - Screen reader announcements
   - Focus management when expanding/collapsing

3. **Test edge cases**:
   - All quarters with $0 taxes
   - Very large numbers (formatting)
   - Negative numbers (if possible)

4. **Test responsive behavior**:
   - Desktop, tablet, mobile views
   - Verify mobile list doesn't show expandable rows (as per design)

5. **Test state persistence**:
   - Expand a row, switch tabs, come back - should it stay expanded?
   - Multiple rows expanded simultaneously

## 🎯 Verdict

**Recommendation: Approve with minor changes**

The implementation is solid and addresses the core requirements well. The main concerns are:
1. Accessibility improvements for the expandable row interaction pattern
2. Verification of the rollover calculation logic
3. Minor code quality improvements

The critical functionality works correctly, and the issues identified are mostly about polish and best practices. The PR can be merged after addressing the accessibility concerns and verifying the rollover calculations are correct.

## Priority of Changes

**Must Fix Before Merge:**
- Verify rollover calculation logic matches backend expectations
- Add focus-visible styles for keyboard accessibility

**Should Fix:**
- Improve expandable row interaction pattern (consider making only first column clickable)
- Add hover states for better UX

**Nice to Have:**
- Reduce code duplication in column config
- Extract magic numbers to constants
- Add JSDoc documentation
