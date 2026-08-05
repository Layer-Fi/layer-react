// FINDING (fix proposed for the packaging phase): consumers on TypeScript 5.6+ with
// `noUncheckedSideEffectImports` enabled — which this library's own tsconfig turns on — cannot
// `import '@layerfi/components/index.css'` without declaring it themselves. The `exports` entry
// resolves fine for bundlers, but tsc wants a declaration and the package ships none.
//
// The library-side fix is to emit `dist/index.d.css.ts` and let consumers set
// `allowArbitraryExtensions`. Until then every consumer needs this shim, so the fixture carries
// it to document the cost rather than hiding it by loosening the compiler options.
declare module '@layerfi/components/index.css'
