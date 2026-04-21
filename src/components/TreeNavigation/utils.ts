export type Key = string | number

const visitTree = <TGroup extends object, TLeaf extends object>(
  items: Iterable<TGroup | TLeaf>,
  isGroup: (item: TGroup | TLeaf) => item is TGroup,
  getChildren: (group: TGroup) => Iterable<TGroup | TLeaf>,
  onGroup: (group: TGroup) => void,
  onLeaf: (leaf: TLeaf) => void,
): void => {
  for (const node of items) {
    if (isGroup(node)) {
      onGroup(node)
      visitTree(getChildren(node), isGroup, getChildren, onGroup, onLeaf)
    }
    else {
      onLeaf(node)
    }
  }
}

type IndexTreeOptions<TGroup extends object, TLeaf extends object> = {
  items: Iterable<TGroup | TLeaf>
  isGroup: (item: TGroup | TLeaf) => item is TGroup
  getChildren: (group: TGroup) => Iterable<TGroup | TLeaf>
  getGroupId: (group: TGroup) => Key
  getLeafId: (leaf: TLeaf) => Key
}

export const indexTree = <TGroup extends object, TLeaf extends object>({
  items,
  isGroup,
  getChildren,
  getGroupId,
  getLeafId,
}: IndexTreeOptions<TGroup, TLeaf>): { groupIds: Key[], leafMap: Map<Key, TLeaf> } => {
  const groupIds: Key[] = []
  const leafMap = new Map<Key, TLeaf>()

  visitTree<TGroup, TLeaf>(
    items,
    isGroup,
    getChildren,
    group => groupIds.push(getGroupId(group)),
    leaf => leafMap.set(getLeafId(leaf), leaf),
  )

  return { groupIds, leafMap }
}
