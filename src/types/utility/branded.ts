const LayerBrandTypeId: unique symbol = Symbol.for('@layerfi/Brand')

type LayerBrand<in out ID extends string | symbol> = {
  readonly [LayerBrandTypeId]: {
    readonly [id in ID]: ID
  }
}

export type LayerBranded<T, ID extends string | symbol> = T & LayerBrand<ID>
