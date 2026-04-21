import { forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'
import {
  Tree as ReactAriaTree,
  TreeItem as ReactAriaTreeItem,
  TreeItemContent as ReactAriaTreeItemContent,
  type TreeItemContentProps as ReactAriaTreeItemContentProps,
  type TreeItemProps as ReactAriaTreeItemProps,
  type TreeProps as ReactAriaTreeProps,
} from 'react-aria-components'

import { withRenderProp } from '@components/utility/withRenderProp'

import './tree.scss'

const TREE_CLASS_NAME = 'Layer__UI__Tree'
const TREE_ITEM_CLASS_NAME = 'Layer__UI__TreeItem'

type TreeProps<T> = ReactAriaTreeProps<T>
const TreeInner = <T extends object>(
  { children, className, ...restProps }: TreeProps<T>,
  ref: React.Ref<HTMLDivElement>,
) => (
  <ReactAriaTree {...restProps} className={classNames(TREE_CLASS_NAME, className)} ref={ref}>
    {withRenderProp(children, node => node) as ReactNode}
  </ReactAriaTree>
)

export const Tree = forwardRef(TreeInner) as (<T>(
  props: TreeProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement) & { displayName?: string }

Tree.displayName = 'Tree'

type TreeItemProps<T> = Omit<ReactAriaTreeItemProps<T>, 'className'>

const TreeItemInner = <T extends object>(
  { children, ...restProps }: TreeItemProps<T>,
  ref: React.Ref<HTMLDivElement>,
) => (
  <ReactAriaTreeItem {...restProps} className={TREE_ITEM_CLASS_NAME} ref={ref}>
    {withRenderProp(children, node => node) as ReactNode}
  </ReactAriaTreeItem>
)

export const TreeItem = forwardRef(TreeItemInner) as (<T>(
  props: TreeItemProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement) & { displayName?: string }

TreeItem.displayName = 'TreeItem'

type TreeItemContentProps = ReactAriaTreeItemContentProps
export const TreeItemContent = ({ children, ...restProps }: TreeItemContentProps) => (
  <ReactAriaTreeItemContent {...restProps}>
    {children}
  </ReactAriaTreeItemContent>
)

TreeItemContent.displayName = 'TreeItemContent'
