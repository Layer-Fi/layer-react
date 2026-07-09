# Date Store Architecture — Design Options for the "All Time" Preset

> Status: design exploration / RFC
> Goal: cleanly support a new **All Time** date preset that requires *context*
> (the business activation date) to resolve, without regressing any current
> behavior and without ever flashing an inaccurate date.

---

## 1. How the current system works

Understanding the existing pieces matters, because the constraint is "retain all
current functionality." Here is the full picture as it exists today.

### 1.1 The store factory (`buildDateStore`)

`src/providers/DateStoreProvider/internal/buildDateStore.ts`

- Takes a single option: `initialDatePreset?: Exclude<DatePreset, Custom>`
  (defaults to `ThisMonth`).
- **Eagerly** resolves that preset to a concrete `DateRange` via
  `rangeForPreset(preset)` → `getDateRange({ mode: 'full', ... })`.
- Creates a zustand store whose state is literally:

  ```ts
  type DateStore = DateRange & { actions: DateActions }
  //   = { startDate: Date, endDate: Date, actions: {...} }
  ```

- **The preset is not stored.** Only the raw resolved range lives in state.
- Actions (`setDate`, `setDateRange`, `setMonth`, `setYear`, `setMonthByPeriod`)
  all clamp/normalize and write a new `{ startDate, endDate }`. End dates are
  clamped to "present or past" via `clampToPresentOrPast`.

### 1.2 The scoped store + hooks (`createScopedDateStore`)

`src/providers/DateStoreProvider/internal/createScopedDateStore.tsx`

- Wraps `createScopedStore` (a React-context + zustand harness).
- The `Provider` creates the store **once, synchronously** with
  `useConstant(createStore)` — there is no way, today, to re-initialize it later.
- Exposes read hooks (`useDate`, `useDateRange`) and action hooks
  (`useDateActions`, `useDateRangeActions`, `usePeriodAlignedActions`).
- Read hooks project the stored range through a `dateSelectionMode`
  (`full` | `month` | `year`) via `getEffectiveDateRangeForMode`.

### 1.3 The global instance (`GlobalDateStoreProvider`)

`src/providers/DateStoreProvider/GlobalDateStoreProvider.tsx` is a **module-level
singleton** produced by `createScopedDateStore()` with the default `ThisMonth`.

Critically, in `LayerProvider.tsx` the tree is:

```tsx
<GlobalDateStoreProvider>      // ← store is created HERE
  <BusinessProvider {...} />   // ← business (activation date) is loaded HERE
</GlobalDateStoreProvider>
```

**The global date store is created *above* the business context.** It therefore
cannot read the business at creation time. This is the structural heart of the
problem: relative presets ("this month") never needed the business, so this
ordering was fine. "All Time" needs the activation date, which only exists
*below* this provider and is *async*.

### 1.4 Preset ↔ range synchronization (the picker UX)

`src/components/DateSelection/DateSelectionComboBox.tsx`

- The current preset is **derived**, not stored:
  `presetForDateRange(dateRange, lastPreset, getActivationDate(business))`.
- Selecting a preset writes a concrete range: `setDateRange(rangeForPreset(preset))`.
- Selecting a custom range causes `presetForDateRange` to return `null` → shown as
  "Custom".
- Note `presetForDateRange` already accepts an `activationDate` for
  normalization — so the preset-matching layer is *already* context-aware, even
  though the store is not.

### 1.5 Context-aware bounds already exist for the single date picker

`src/hooks/utils/dates/useBusinessDatePickerBounds.ts` reads the activation date
from `LayerContext` and returns `{ minDate: Date | null, maxDate: Date }`.
`minDate` is `null` while the business is loading. `GlobalDatePicker` +
`useDatePickerState` already tolerate `null` bounds gracefully. This is a useful
precedent: **bounds** are allowed to be temporarily unknown; the **selected
value** never is.

### 1.6 Business loading semantics

`BusinessProvider` seeds `business: undefined`, fetches via SWR (`useBusiness`),
and sets it through a reducer effect once loaded. There is no app-wide "block
until business" gate today — everything treats `business` as optional
(`business?.activationAt`).

---

## 2. The problem, stated precisely

Adding **All Time** introduces a preset whose resolved range is:

```
startDate = startOfDay(business.activationAt)   // requires CONTEXT (async)
endDate   = endOfDay(now)                        // requires "now" (already handled)
```

This breaks three assumptions baked into the current design:

1. **Presets were pure functions of `now`.** `rangeForPreset` is synchronous and
   context-free. All Time is not.
2. **The store is born fully-resolved and above the business.** It cannot see the
   activation date at construction time.
3. **The store's dates are always concrete `Date`s.** There was never a "we don't
   know yet" state to represent.

And we must honor these product constraints:

- **C1 — Never show a wrong date.** Prefer a loading state over
  "show-wrong-then-fix-with-`useEffect`."
- **C2 — Configure by preset, not by concrete dates.** `initialDatePreset:
  AllTime` should "just work."
- **C3 — Preserve preset ↔ range selection sync** (the combobox behavior).
- **C4 — Don't block the whole page.** Block only the date pickers and the
  date-dependent tables, not everything.
- **C5 — Composable & low-cognitive-load.** A future dev passes a preset to the
  factory, wraps a subtree, and every picker underneath "just works" and is never
  wrong.

---

## 3. The three open questions, answered up front

Because they drive every option, here are the recommendations with rationale. The
options in §4 are then evaluated against these.

### Q1 — Should we store the preset in the store (not just the range)?

**Recommendation: Yes — store the preset alongside the range**, as a single
discriminated source of truth kept consistent by the actions.

```ts
type DateStore = DateRange & {
  preset: DatePreset            // ThisMonth | ... | AllTime | Custom
  actions: DateActions
}
```

Why it's cleaner, not messier:

- **Intent survives.** A raw range `{Jan 1 … today}` is ambiguous — is it "All
  Time" or a custom range that happens to start at activation? Storing the preset
  records *why* the range is what it is, which is exactly what All Time needs to
  be re-resolvable when "now" advances.
- **The combobox stops reverse-engineering.** Today it runs `presetForDateRange`
  to guess the active preset. With a stored preset it reads it directly; the
  fragile derivation becomes a *fallback* only for genuinely custom ranges.
- **It makes C2 literal.** "The preset determines the initial range" becomes a
  stored fact rather than a lossy projection.

The classic objection — "two sources of truth can drift" — is neutralized by
routing every mutation through actions that set `preset` and `range` together:

- `setPreset(preset)` → resolves range from preset, stores both.
- `setDateRange(raw)` / `setDate` / `setMonth` / `setYear` → store the range and
  set `preset = Custom` (or, optionally, derive it so an exact preset match
  re-labels itself, preserving today's combobox nicety).

### Q2 — Can we leave the store uninitialized and initialize it later, via the factory?

**Recommendation: Yes, and this is the linchpin of the recommended design.** But
"uninitialized" should live at the **Provider boundary**, not inside the store's
state. The zustand store is simply **not created until its required context is
available**. Because `createScopedStore`'s `Provider` builds the store lazily with
`useConstant`, we can gate that construction behind a resolver and the store is
**born correct** — no nullable phase, no `useEffect` hydration, no wrong flash.
See Option B / the recommendation.

### Q3 — Should the store's date fields be nullable?

**Recommendation: No.** Keep `startDate`/`endDate` as concrete, non-null `Date`s
inside the store. Represent "not resolvable yet" as a **provider-level loading
boundary**, never as `null` state.

- Nulls push the "what if it's not ready?" branch into *every* low-level consumer
  and every table — the opposite of C5.
- The one thing that legitimately can be unknown (picker **bounds**) is already
  `Date | null` and handled locally (§1.5). The *selected value* should never be
  null.

---

## 4. Architectural contenders

Four options, from "smallest diff" to "cleanest model." Each is judged against
C1–C5 and Q1–Q3.

### Option A — Resolve at read time (lazy selectors + Suspense)

Keep the store eager and dumb, but store the **preset**. `useDateRange` computes
the concrete range on read: relative presets from `now`, All Time from a
context hook. While the activation date is loading, the hook **suspends** (or
returns a discriminated `{ status: 'loading' }`).

```ts
function useDateRange({ dateSelectionMode }) {
  const preset = useSelector(s => s.preset)
  const rawRange = useRawRange()                 // from store
  const activation = useBusinessActivationDate() // may be undefined
  if (preset === AllTime && activation == null) {
    // suspend, or return { status: 'loading' }
  }
  return resolve(preset, rawRange, activation, dateSelectionMode)
}
```

- **C1 (never wrong):** ✅ if it suspends; the range is computed from real context
  or not returned at all.
- **C2 (by preset):** ✅ preset lives in state.
- **C3 (sync):** ✅ combobox reads/writes preset directly.
- **C4 (scoped blocking):** ✅ via `<Suspense>` boundaries around date-dependent
  subtrees.
- **C5 (composable):** ⚠️ Leaky. Every consumer must be under a Suspense boundary
  *or* handle a `loading` union. The "not ready" concept leaks into read sites —
  precisely what we want to avoid. Also the store can hold a preset (`AllTime`)
  whose range it cannot itself express, so `store.getState()` is no longer a
  complete answer.
- **Store stays above business:** ✅ no tree changes.

**Verdict:** Minimal structural change, but it spreads the async concern across
all read sites. Good runner-up; not the cleanest mental model.

### Option B — Deferred (context-aware) provider construction ★

Make the **Provider** context-aware. It resolves the initial range *before*
constructing the zustand store. For relative presets this is synchronous and
instant. For All Time, the provider reads the activation date; until it's
available it renders a `fallback` (loading) and **does not mount the store**. Once
available, it mounts the store exactly once, with concrete dates. Store state
stays `{ startDate: Date, endDate: Date, preset, actions }` — always valid.

```tsx
function Provider({ children, fallback = null }) {
  const resolved = useResolvedInitialRange(initialDatePreset)
  // relative → { status: 'ready', range } synchronously
  // AllTime  → { status: 'loading' } until activation date resolves
  if (resolved.status === 'loading') return <>{fallback}</>
  return (
    <InnerStoreProvider initialRange={resolved.range} initialPreset={initialDatePreset}>
      {children}
    </InnerStoreProvider>
  )
}
```

- **C1:** ✅ Store is *born correct*. No consumer ever observes a wrong or absent
  date, because consumers don't mount until the store exists.
- **C2:** ✅ Factory takes a preset; resolution is internal.
- **C3:** ✅ Preset stored; combobox unchanged in spirit.
- **C4:** ✅ Scope is exactly the provider's subtree. Wrap only the date pickers +
  date-dependent tables in an All Time provider (below `BusinessProvider`) and
  only *that* subtree shows the fallback while the business loads.
- **C5:** ✅ **Best.** All async/"not ready" complexity is contained in the
  provider. Every hook below returns concrete, non-null values — "just works."
- **Store position:** context-dependent presets require the provider to sit
  **below** the context that feeds them. That's a clear, enforceable rule (and we
  can throw a helpful error if `AllTime` is used with no business context —
  mirroring the existing "DateStore hooks must be used within Provider" pattern).

**Cost / caveats:**

- The global store default must remain a **relative** preset (`ThisMonth`) so the
  app-wide provider stays above `BusinessProvider` and never blocks the whole app.
  All Time is opted into per-subtree. (This matches the product ask: "instantiate
  a store with All Time" is a *feature/page* concern, not the global default.)
- "Now" for the All Time end date is frozen at mount. Activation date is
  effectively static per business, so re-resolution is a non-issue; if a live
  end-of-day tick is ever needed, layer a clamp-on-read (as `getDateRange` already
  does with `clampToPresentOrPast`).

**Verdict:** Cleanest model. Complexity has exactly one home.

### Option C — Nullable state + `useEffect` hydration (rejected)

Create the store immediately with `startDate: null`, then fill it in via
`useEffect` once the business loads.

- **C1:** ❌ This is the exact anti-pattern the user called out — a wrong/empty
  value first, corrected later. Guarantees a flash or an all-consumers null-check.
- **C5:** ❌ Nulls everywhere.

**Verdict:** Explicitly rejected. Documented only to close the door on it.

### Option D — Two-phase store: config object now, `initialize()` later

Store holds a `phase: 'pending' | 'ready'` plus an imperative
`actions.initialize(range)` called from an effect once context arrives.

- More explicit than C, but still exposes a `pending` phase to consumers (C5 ❌)
  and reintroduces effect-driven initialization (C1 risk). It's Option B's idea
  done *inside* the store instead of at the provider — strictly worse, because the
  invalid phase becomes observable.

**Verdict:** Dominated by Option B.

### Scorecard

| | A: read-time | **B: deferred provider** | C: nullable+effect | D: two-phase store |
|---|---|---|---|---|
| C1 never wrong | ✅ (needs Suspense) | ✅ born-correct | ❌ | ⚠️ |
| C2 configure by preset | ✅ | ✅ | ✅ | ✅ |
| C3 preset↔range sync | ✅ | ✅ | ✅ | ✅ |
| C4 scoped blocking | ✅ | ✅ | ✅ | ✅ |
| C5 composable / no leak | ⚠️ leaks to reads | ✅ contained | ❌ nulls everywhere | ❌ pending leaks |
| Store always concrete | ⚠️ (range derived) | ✅ | ❌ | ❌ |
| Structural change | small | medium | small | medium |

---

## 5. Recommendation — Option B (deferred provider) + stored preset + non-null state

Combine the three answers from §3 with Option B:

1. **Store the preset** next to the range (Q1). One discriminated source of truth,
   kept consistent by actions.
2. **Non-null, always-concrete `Date`s** in the store (Q3). "Not ready" is never a
   store value.
3. **Deferred, context-aware Provider construction** (Q2 + Option B). The store is
   not built until its preset can be fully resolved; relative presets resolve
   instantly, All Time waits (only in its own subtree) for the activation date and
   is then born correct.

This is the design that most directly satisfies C1 and C5: the entire notion of
"async / not-ready" is quarantined inside one provider file. Downstream — pickers,
tables, report hooks — nothing changes and nothing can be wrong.

### 5.1 Shape sketch

```ts
// dateRangePresets.ts
export enum DatePreset {
  ThisMonth, LastMonth, ThisQuarter, LastQuarter, ThisYear, LastYear,
  AllTime,   // NEW — context-dependent
  Custom,
}

// Keep rangeForPreset PURE (now-only). Context-dependent presets are NOT
// handled here — that separation is deliberate.
```

```ts
// A single place that knows which presets need context, and how to resolve them.
type ResolvedRange =
  | { status: 'ready', range: DateRange }
  | { status: 'loading' }

function useResolvedInitialRange(preset: DatePreset): ResolvedRange {
  const activation = useBusinessActivationDate() // Date | undefined

  if (preset === DatePreset.AllTime) {
    if (activation == null) return { status: 'loading' }
    return {
      status: 'ready',
      range: {
        startDate: startOfDay(activation),
        endDate: endOfDay(new Date()),
      },
    }
  }
  // every relative preset resolves synchronously
  return { status: 'ready', range: rangeForPreset(preset) }
}
```

```tsx
// createScopedDateStore Provider — the ONLY place that knows about loading.
function Provider({ children, fallback = null }: PropsWithChildren<{ fallback?: ReactNode }>) {
  const resolved = useResolvedInitialRange(initialDatePreset)
  if (resolved.status === 'loading') return <>{fallback}</>
  return (
    <InnerProvider initialRange={resolved.range} initialPreset={initialDatePreset}>
      {children}
    </InnerProvider>
  )
}
```

```ts
// buildDateStore now takes a resolved range + preset (no preset-resolution here).
export function buildDateStore({ initialRange, initialPreset }: {
  initialRange: DateRange
  initialPreset: DatePreset
}) {
  return createStore<DateStore>((set) => ({
    ...initialRange,
    preset: initialPreset,
    actions: {
      setPreset: (preset) => { /* resolve + set {range, preset} */ },
      setDateRange: withCorrectedRange(({ startDate, endDate }) =>
        set({ ...getDateRange({ mode: 'full', startDate, endDate }), preset: DatePreset.Custom })),
      // setDate / setMonth / setYear → set range + preset: Custom (or derived)
      ...
    },
  }))
}
```

### 5.2 How each requirement is met

- **C1 — never wrong:** the store cannot exist with an unresolved All Time range;
  consumers mount only after it's concrete. No `useEffect` correction.
- **C2 — preset config:** `createScopedDateStore({ initialDatePreset: DatePreset.AllTime })`.
- **C3 — sync preserved:** `DateSelectionComboBox` reads the stored `preset` via a
  new selector and calls `actions.setPreset`. `presetForDateRange` stays as the
  fallback for exact-match relabeling of custom ranges — today's UX is intact.
- **C4 — scoped loading:** the All Time provider (placed below `BusinessProvider`)
  renders its `fallback` (a skeleton) around just the pickers + tables that need
  the range. The rest of the page renders immediately.
- **C5 — composable:** the only new knowledge a future dev needs is *"if you pick a
  context-dependent preset, mount the provider below the context it needs, and
  give it a `fallback`."* Everything else is unchanged and non-null.

### 5.3 Guardrails

- If `AllTime` is selected but no business context is present, throw a descriptive
  error from `useResolvedInitialRange` (consistent with the existing
  "hooks must be used within Provider" and the deliberate DateStore
  missing-provider throw). Fail loud at dev time rather than render wrong.
- Keep `rangeForPreset` pure and context-free; keep all context resolution in the
  resolver hook. This preserves testability (the existing `createScopedDateStore`
  tests using fake system time still hold for relative presets).
- The global store keeps `ThisMonth` and stays above `BusinessProvider`. Do not
  move the global provider below business — that would block the whole app (C4).

---

## 6. What changes, concretely

| File | Change |
|---|---|
| `utils/date/dateRangePresets.ts` | Add `DatePreset.AllTime`; keep `rangeForPreset` pure (no AllTime case). |
| `providers/DateStoreProvider/internal/types.ts` | Add `preset: DatePreset` to `DateStore`; add `setPreset` to `DateActions`. |
| `providers/DateStoreProvider/internal/buildDateStore.ts` | Accept `{ initialRange, initialPreset }`; store preset; actions set preset+range together. |
| `providers/DateStoreProvider/internal/createScopedDateStore.tsx` | Split into resolver-gated `Provider` + `InnerProvider`; add `useResolvedInitialRange`; add `fallback` prop; expose a `usePreset` selector. |
| `components/DateSelection/DateSelectionComboBox.tsx` | Read stored `preset`; add the "All Time" option; call `setPreset`. `presetForDateRange` becomes fallback-only. |
| `GlobalDateStoreProvider.tsx` | Unchanged default (`ThisMonth`); optionally re-export `usePreset`. |
| Consumers (tables/pickers) | No change — they still read concrete non-null dates. New All-Time subtrees get wrapped in a provider + `fallback`. |

---

## 8. Big-picture reconsideration — fix the provider *order* (recommended foundation)

The options above all treat "the date store lives above `BusinessProvider`" as a
fixed constraint and work around it. That constraint turns out to be **an
accident**, and removing it is the highest-leverage change available.

### 8.1 Why the store is above business today — and why it shouldn't be

In `LayerProvider.tsx` the order is `GlobalDateStoreProvider` → `BusinessProvider`.
The *only* thing that depends on this order is a **vestigial re-export**:

```ts
// BusinessProvider.tsx
const globalDateRange = useGlobalDateRange({ dateSelectionMode: 'full' })   // ← reads the store
const { setDateRange } = useGlobalDateRangeActions()
const dateRange = useMemo(() => ({ range: globalDateRange, setRange: setDateRange }), ...)
// ...later merged into LayerContext value as `dateRange`
```

Investigation of every *internal* consumer shows:

- **No code in this repo reads `LayerContext.dateRange.range` or `.setRange`.** Zero
  hits.
- The real internal consumer of the global range, `useBankTransactionsFilters`,
  calls `useGlobalDateRange()` **directly**, not through `LayerContext`.
- `DateSelectionComboBox` calls `useLayerContext()` only for `business`; its
  `dateRange` is a prop.

> **⚠️ Correction — this is NOT dead code.** `useLayerContext` is a **public export**
> (`src/index.tsx:64`), so `LayerContext.dateRange` is part of the library's public
> API. "No internal consumers" ≠ "no consumers": embedding applications may call
> `useLayerContext().dateRange.setRange` from their own custom components to read and
> drive the global date range. **Preserving this export is a hard requirement.** The
> earlier framing of this coupling as deletable dead code was wrong.

The dependency direction is still, in principle, backwards — the date store depends
on the business, so business "wants" to be the ancestor. But the public-API
constraint means we cannot simply delete the re-export, and reordering now *costs* an
extra re-injection layer (the bridge in §8.2.1) rather than saving code. That
materially weakens the case for reordering; see the revised recommendation in §9.

### 8.2 Option E — Reorder the providers + delete the dead coupling ★★

```tsx
// Before
<GlobalDateStoreProvider>
  <BusinessProvider>{children}</BusinessProvider>
</GlobalDateStoreProvider>

// After — business context is now an ancestor of every date store
<BusinessProvider>
  <GlobalDateStoreProvider>{children}</GlobalDateStoreProvider>
</BusinessProvider>
```

Concretely:

1. Move `GlobalDateStoreProvider` to wrap `children` **inside** `BusinessProvider`
   (below `LayerContext.Provider`, e.g. around/with `BankAccountsProvider`).
2. Stop having `BusinessProvider` read the store; instead re-inject `dateRange` into
   the context from a **bridge** mounted below the store (§8.2.1) so the public API
   survives.

**Why this is architecturally appealing:**

- **It dissolves the root cause.** Every date store in the app — the global one
  *and* any scoped one — is now structurally guaranteed to be below the business
  context. The activation date is *always* readable at (or shortly after) store
  construction. No "manually remember to place this provider below business" rule;
  no runtime throw guarding against misplacement. This is the biggest win for C5
  (future devs don't need deep context — correct placement is automatic).
- **It removes dead code**, shrinking the `LayerContext` surface and eliminating a
  confusing store→context→store data path.
- **It makes All Time uniformly available**, not just in subtrees a dev remembers
  to position correctly.

**Costs / risks:**

- **The public API must be preserved (mandatory bridge).** Because
  `useLayerContext().dateRange` is public (§8.1), reordering *requires* the bridge in
  §8.2.1 to keep re-exposing `dateRange`/`setRange`. This is a net *addition* of a
  layer, not a deletion — the opposite of the code-shrinking benefit originally
  claimed.
- Every global-date consumer must stay below `GlobalDateStoreProvider`. They already
  are (all 29 live in `children`), so this is a no-op in practice — but it's the
  invariant to preserve.
- Reordering does **not**, by itself, solve the *async* window: even below the
  business, `activationAt` is `undefined` until SWR resolves. Reorder fixes *tree
  position*; the loading window is still handled by the deferred provider (§5 /
  Option B). The two changes compose — reorder makes Option B's resolver able to
  read business context structurally instead of by convention.

### 8.2.1 Preserving the public `dateRange` API after a reorder — the bridge

After the reorder, `BusinessProvider` (which provides `LayerContext`) sits *above*
the store, so it can no longer read the store to fill `dateRange`. Re-inject it from
a small component mounted *below* the store:

```tsx
function LayerContextDateRangeBridge({ children }: PropsWithChildren) {
  const base = useContext(LayerContext)                          // business, theme, colors, …
  const range = useGlobalDateRange({ dateSelectionMode: 'full' })
  const { setDateRange } = useGlobalDateRangeActions()
  const value = useMemo(
    () => ({ ...base, dateRange: { range, setRange: setDateRange } }),
    [base, range, setDateRange],
  )
  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
}
```

```
<BusinessProvider>              // base LayerContext (business); store resolver reads business HERE
  <GlobalDateStoreProvider>     // store, born below business
    <LayerContextDateRangeBridge>   // re-provides context WITH a live dateRange
      {children}                    // consumers' custom components: see business AND dateRange
    </LayerContextDateRangeBridge>
  </GlobalDateStoreProvider>
</BusinessProvider>
```

Why this is safe:

- **No circular dependency.** The store's resolver reads `business` from the *base*
  context provided above the store; only the bridge (below the store) reads the
  store. Business is available in only one context (`LayerContext`), so this ordering
  is the thing that keeps it acyclic.
- **Do NOT fold the store hooks into `useLayerContext` itself.** `ToastsContainer`
  (`Toast.tsx`) calls `useLayerContext()` and, after the reorder, renders *above* the
  store — composing store hooks into the base hook would make it throw. The bridge
  keeps `useLayerContext` a plain `useContext` and augments only the subtree below the
  store, which is exactly where consumer components live.
- **Type hygiene:** the base context value between `BusinessProvider` and the bridge
  technically lacks a real `dateRange`. Give it a safe sentinel (or narrow the base
  type and widen at the bridge) since nothing above the bridge reads it.

### 8.3 The crucial nuance reordering exposes: *scope of blocking*

Reordering tempts a follow-on question: "now that the global store is below
business, should its default be All Time?" **No — keep the global default relative
(`ThisMonth`).** Here's why the scope matters (C4):

- The global provider wraps the **entire app**. If its initial preset required async
  context, deferring its construction would block the **whole page** until the
  business loads — exactly what C4 forbids.
- A relative preset resolves **synchronously**, so the global store is born correct
  with zero blocking, even below business.

Therefore the blocking granularity is a deliberate design lever:

| Store | Default preset | Placement | Blocking behavior |
|---|---|---|---|
| **Global** (app-wide) | relative (`ThisMonth`) | wraps whole app, below business | never blocks (synchronous) |
| **Scoped** (a page/feature) | anything incl. `AllTime` | wraps only that subtree's pickers + tables | blocks only that subtree, via `fallback` |

"This page is All Time by default" = mount a **scoped** `createScopedDateStore({
initialDatePreset: AllTime })` around just the date-dependent portion. The deferred
provider shows a skeleton there while business loads; the rest of the page renders
immediately.

### 8.4 Option E2 — Reorder + Suspense-expose business (mechanism variant)

Same reorder, but instead of each date store's provider conditionally rendering a
`fallback`, `BusinessProvider` exposes the business as a Suspense resource and the
resolver calls `use()`/reads a suspending hook. Date-dependent subtrees sit under
`<Suspense fallback={...}>`. Functionally equivalent to Option B's gating; choose
based on how the codebase already handles async (conditional-render vs Suspense).
This is an implementation detail of *how the loading window waits*, layered on top
of the Option E reorder.

---

## 9. Revised recommendation — phased, keep both paths open

Decision input: **All Time is definitely needed for scoped/per-page stores now; the
global store *may* want it later (undecided).** And `LayerContext.dateRange` is a
public API that must keep working throughout. The recommendation is therefore
**phased**, chosen so that Phase 1 ships the full mechanism and Phase 2 (if ever
needed) is a small additive change with **no rewrite**.

The enabling insight: **the machinery a scoped All Time store needs (context-aware
resolver + deferred, born-correct provider + stored preset + non-null state) is
exactly the machinery the global store would need after a reorder.** Build it once,
now, in the factory. The only thing Phase 2 adds is the provider reorder plus the
§8.2.1 bridge — the store, factory, resolver, hooks, and every consumer are
untouched.

### Phase 1 — ship now (no reorder, public API untouched)

1. **Keep the provider order as-is.** `GlobalDateStoreProvider` stays above
   `BusinessProvider`; `LayerContext.dateRange` keeps being populated exactly as
   today. Zero risk to the public API.
2. **Global store keeps a relative default (`ThisMonth`)** — synchronous, never
   blocks, never needs business (C4).
3. **Add `DatePreset.AllTime`**; keep `rangeForPreset` pure; add the context-aware
   `useResolvedInitialRange` resolver.
4. **Store the preset** in `DateStore`; make the factory's `Provider` defer
   construction until the resolver is `ready` — born-correct, non-null (§5.1). Add a
   `fallback` prop.
5. **Wire the combobox** to read the stored preset and add the "All Time" option.
6. **Adopt All Time per subtree:** a page/feature mounts
   `createScopedDateStore({ initialDatePreset: AllTime })` around just its pickers +
   tables. Because all app content already renders below `BusinessProvider`, that
   scoped provider is automatically below the business context and its resolver reads
   `activationAt` without any special placement.

This satisfies every constraint (C1–C5) and every open question (Q1–Q3) for the
stated need, and touches nothing about the public API or the global provider.

### Phase 2 — only if the global store must default to All Time

1. **Reorder** so `BusinessProvider` wraps `GlobalDateStoreProvider` (§8.2).
2. **Add the `LayerContextDateRangeBridge`** (§8.2.1) to keep exposing
   `dateRange`/`setRange` on `LayerContext` for embedding apps.
3. The global provider now defers just like a scoped one. **Caveat (C4):** because
   the global provider wraps the whole app, an All Time *global default* means the
   app-wide `fallback` shows until the business loads. Only take Phase 2 if that
   app-level loading state is acceptable — otherwise keep the global default relative
   and rely on scoped All Time.

No store/factory/consumer code changes between phases — Phase 2 is purely the two
structural edits above.

### Why not reorder now anyway?

Because the public-API constraint flips the reorder from a code-*shrinking* cleanup
into a code-*adding* one (the mandatory bridge), and the only capability it unlocks —
All Time on the *global* store — is exactly the thing that reintroduces app-wide
blocking (C4). Until that capability is actually required, reordering adds surface
area and risk without benefit. Phase 1 already makes All Time "just work" everywhere
a scoped store is used.

### Updated scorecard

| | A: read-time | **Phase 1 (B, scoped)** | Phase 2 (E: reorder + bridge) | C: nullable | D: two-phase |
|---|---|---|---|---|---|
| C1 never wrong | ✅ (Suspense) | ✅ born-correct | ✅ | ❌ | ⚠️ |
| C2 by preset | ✅ | ✅ | ✅ | ✅ | ✅ |
| C3 sync | ✅ | ✅ | ✅ | ✅ | ✅ |
| C4 scoped blocking | ✅ | ✅ | ⚠️ global default blocks app | ✅ | ✅ |
| C5 composable | ⚠️ leaks to reads | ✅ (scoped placed below business by default) | ✅ guaranteed by tree | ❌ | ❌ |
| Preserves public `dateRange` API | ✅ | ✅ untouched | ✅ via bridge | ✅ | ✅ |
| Global store can default All Time | ❌ | ❌ (scoped only) | ✅ | ❌ | ❌ |
| Structural change | small | medium | medium (+ reorder + bridge) | small | medium |

---

## 10. TL;DR

- **`LayerContext.dateRange` is a public API, not dead code.** `useLayerContext` is
  exported, so embedding apps may drive the global range through it. Preserving that
  export is a hard requirement — this corrects the earlier "just delete it" framing.
- **Phase 1 (ship now): don't reorder.** Keep `GlobalDateStoreProvider` above
  `BusinessProvider` so `LayerContext.dateRange` keeps working untouched. Global store
  keeps a *relative* default (`ThisMonth`) — synchronous, never blocks.
- **All Time is a scoped-store feature.** A page mounts
  `createScopedDateStore({ initialDatePreset: AllTime })` around just its pickers +
  tables; it's automatically below `BusinessProvider`, so the resolver reads the
  activation date. Only that subtree shows a `fallback` while the business loads (C4).
- **Store the preset** (Q1: yes), keep dates **non-null** (Q3: no), and **defer store
  construction until the resolver is ready** (Q2: yes) so the store is *born correct*
  — no wrong-then-`useEffect` flash.
- **Phase 2 (only if the global store must default to All Time): reorder + a bridge.**
  `BusinessProvider` wraps `GlobalDateStoreProvider`, and a `LayerContextDateRangeBridge`
  below the store re-injects `dateRange`/`setRange` so the public API survives. No
  store/factory/consumer rewrite — the Phase 1 machinery is exactly what the global
  store needs. Trade-off: an All Time *global default* means an app-wide loading state.
- Net: All Time works everywhere a scoped store is used today, the public API is
  untouched, every existing behavior is preserved, and the global-All-Time door stays
  open behind two small additive edits.
