const LayerBrandTypeId: unique symbol = Symbol.for('@layerfi/Brand')

type LayerBrand<in out ID extends string | symbol> = {
  readonly [LayerBrandTypeId]: {
    readonly [id in ID]: ID
  }
}

type LayerBranded<T, ID extends string | symbol> = T & LayerBrand<ID>

/*
 * It appears that `npm-dts` does not like constructing branded types outside of the
 * file where the symbol is declared.
 */
export type EmailAddress = LayerBranded<string, 'EmailAddress'>
export type PhoneNumber = LayerBranded<string, 'PhoneNumber'>
