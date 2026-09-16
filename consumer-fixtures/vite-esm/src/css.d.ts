// Every consumer needs this shim: under `noUncheckedSideEffectImports` (TS 5.6+) the CSS import
// needs a declaration and the package ships none. Kept here rather than loosening the fixture's
// compiler options, so the cost stays visible. Library-side fix (`dist/index.d.css.ts`) is phase 3.
declare module '@layerfi/components/index.css'
