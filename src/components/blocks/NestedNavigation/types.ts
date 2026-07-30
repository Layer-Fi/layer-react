import type { ReactNode } from 'react'

export type Key = string | number

type NestedNavigationItemConfig<T> = {
  getId: (item: T) => Key
  getTextValue: (item: T) => string
  renderLabel: (item: T) => ReactNode
}

export type RecursiveNestedNavigationGroupConfig<TGroup, TLeaf> = NestedNavigationItemConfig<TGroup> & {
  isRecursive: true
  getChildren: (group: TGroup) => Iterable<TGroup | TLeaf>
}

export type FlatNestedNavigationGroupConfig<TGroup, TLeaf> = NestedNavigationItemConfig<TGroup> & {
  isRecursive: false
  getChildren: (group: TGroup) => Iterable<TLeaf>
}

export type NestedNavigationGroupConfig<TGroup, TLeaf> =
  | RecursiveNestedNavigationGroupConfig<TGroup, TLeaf>
  | FlatNestedNavigationGroupConfig<TGroup, TLeaf>

export type NestedNavigationLeafConfig<TLeaf> = NestedNavigationItemConfig<TLeaf> & {
  onSelectLeaf: (leaf: TLeaf) => void
}
