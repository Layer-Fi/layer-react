# BulkCategorizationTaskListItem Frontend Handoff

## Purpose
This document captures the current frontend implementation of `BulkCategorizationTaskListItem`, how Automated tasks are now wired through the existing bookkeeping periods payload, and what still remains for submission handling.

## Current status
As of March 17, 2026:
- `Automated_Task` rendering is wired in desktop and mobile task lists.
- Automated task typing matches the new suggestion contract (`suggestion_1/2/3`, `suggestion_personal`, and resolved `*_category` fields).
- Category pill options are now fed from suggestion category payloads (`suggestion_1_category`, `suggestion_2_category`, `suggestion_3_category`) instead of only fixed placeholders.
- Save action is still local-only (no backend submit mutation yet).

## Files changed
- `src/components/Tasks/BulkCategorizationTaskListItem.tsx`
- `src/components/Tasks/bulkCategorizationTaskListItem.scss`
- `src/components/Tasks/TasksList.tsx`
- `src/components/Tasks/TasksListMobile.tsx`
- `src/components/Tasks/bulkCategorizationTaskMappers.ts`
- `src/types/tasks.ts`

## What the component does now
`BulkCategorizationTaskListItem` mirrors the existing `TasksListItem` accordion shell and adds bulk categorization controls.

### Public props
```ts
export type BulkCategorizationCategoryOption = {
  label: string
  value: string
}

export type BulkCategorizationTransaction = {
  id: string
  merchantName: string
  date: string
  amount: string
  initialCategory?: string
}

export type BulkCategorizationSelection = {
  scope: 'business' | 'personal'
  category: string | null
  action: 'mix' | 'other' | 'ask-later' | null
  mixedCategories: Record<string, string>
}

type BulkCategorizationTaskListItemProps = {
  task: RawAutomatedTask
  defaultOpen: boolean
  description: string
  transactions?: ReadonlyArray<BulkCategorizationTransaction>
  categoryOptions?: ReadonlyArray<BulkCategorizationCategoryOption>
  onExpandTask?: (isOpen: boolean) => void
  onSave?: (selection: BulkCategorizationSelection) => void
}
```

### State behavior
- Accordion open/close follows the same pattern as `TasksListItem`.
- Scope toggle: `Business | Personal`.
- Top category group and action group are mutually exclusive.
- Selecting a top category clears action.
- Selecting an action clears top category.
- Selecting `A mix of the above` (`action === 'mix'`) reveals transaction rows.
- Each transaction row has its own category choice map in `mixedCategories`.
- Save button label is `Save` by default and `Save all` when mixed mode is active.

## Data flow now in place

### Source endpoint
- Tasks still come from bookkeeping periods:
  - `GET /v1/businesses/{businessId}/bookkeeping/periods`
- The frontend now expects each task in `period.tasks` to be discriminated by `task.type`:
  - `Human_Task`
  - `Automated_Task`

### Type model
`src/types/tasks.ts` now defines:
- `RawHumanTask` (`type: 'Human_Task'`)
- `RawAutomatedTask` (`type: 'Automated_Task'`, includes `task_type`, non-null `source_suggestion_id`, and `suggestion`)
- `AutomatedTaskSuggestion` with:
  - `suggestion_1`, `suggestion_2`, `suggestion_3`, `suggestion_personal`
  - `suggestion_1_category`, `suggestion_2_category`, `suggestion_3_category`
- `RawTask = RawHumanTask | RawAutomatedTask`

### Rendering branch
`src/components/Tasks/TasksList.tsx` and `src/components/Tasks/TasksListMobile.tsx` branch on task type:
- `isHumanTask(task)` -> `TasksListItem`
- `isAutomatedTask(task)` -> `BulkCategorizationTaskListItem`

### Automated suggestion mapping
`src/components/Tasks/bulkCategorizationTaskMappers.ts` handles mapping from Automated suggestion to UI props:
- `mapAutomatedTaskToBulkCategorizationTransactions(task)`
  - maps `suggestion.transactions_that_will_be_affected` to `BulkCategorizationTransaction[]`
  - formats date and amount for display
- `mapAutomatedTaskToBulkCategorizationCategoryOptions(task)`
  - maps `suggestion_1_category`, `suggestion_2_category`, `suggestion_3_category` into deduped UI category options
- `getBulkCategorizationTaskDescription(task)`
  - generates prompt text from counterparty and transaction count

## Styling decisions implemented
These are the latest adjustments based on design feedback:
- Unselected buttons use white background.
- The mixed-transactions container is white.
- Row-level mini category pills are white when unselected.
- Row-level mini pill typography is reduced to `var(--text-sm)`.
- Expanded body no longer uses a darker inset panel; it spans the card area more like Figma.
- Header chevron layout matches the original `TasksListItem` structure to prevent overlap with title text.

## Remaining backend integration

### Submit endpoint status
Per backend ADR, this endpoint is Phase 3 and not yet implemented:
- `POST /v1/businesses/{businessId}/bookkeeping/ai/tasks/{taskId}/submit`

### Frontend gap
- `BulkCategorizationTaskListItem` currently emits `onSave(selection)` but no network mutation is wired yet.
- There is no loading/error/success state tied to a submit request yet.

### Suggested payload shape for save mapping
Adjust names to match backend docs.

```ts
// non-mix
{
  taskId,
  scope, // business | personal
  decision: {
    mode: 'single',
    category, // selected suggestion category id
  },
}

// mix
{
  taskId,
  scope,
  decision: {
    mode: 'mixed',
    splits: Object.entries(mixedCategories).map(([transactionId, category]) => ({
      transactionId,
      category,
    })),
  },
}
```

## Integration checklist for next agent
- [x] Read backend task contract and branch on `task.type`.
- [x] Remove mock task injection from task list.
- [x] Render bulk component conditionally from real Automated task data.
- [x] Feed suggestion category payload into bulk category options.
- [x] Validate desktop and mobile behavior for conditional rendering.
- [ ] Implement submit mutation when backend Phase 3 endpoint is available.
- [ ] Map `BulkCategorizationSelection` into backend submit action schema.
- [ ] Handle loading/disabled save state during submit.
- [ ] Handle success state (refresh tasks, collapse task, and/or optimistic status update).
- [ ] Handle error state per existing task UX patterns.
- [ ] Add/adjust tests for `Automated_Task` rendering branch and mapper behavior.
- [ ] Run `npm run typecheck` and `npx lint-staged`.

## Notes for future iterations
- `BulkCategorizationTaskListItem` now prefers payload-driven category options. It falls back to legacy placeholder options when suggestion category payload is missing.
- If localized currency/date formatting requirements change, update mapper formatting helpers in `bulkCategorizationTaskMappers.ts`.
