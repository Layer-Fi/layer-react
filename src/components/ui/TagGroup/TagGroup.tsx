import { type ComponentProps, forwardRef } from 'react'
import {
  Tag as ReactAriaTag,
  TagGroup as ReactAriaTagGroup,
  TagList as ReactAriaTagList,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'

import './tagGroup.scss'

const TAG_CLASS_NAMES = {
  GROUP: 'Layer__TagGroup',
  LIST: 'Layer__TagList',
  TAG: 'Layer__Tag',
} as const

type TagGroupProps = Omit<
  ComponentProps<typeof ReactAriaTagGroup>,
  'className'
>

export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(
  function TagGroup(props, ref) {
    return (
      <ReactAriaTagGroup
        {...props}
        className={TAG_CLASS_NAMES.GROUP}
        ref={ref}
      />
    )
  },
)

type TagListProps<T extends Record<string, unknown>> = Omit<
  ComponentProps<typeof ReactAriaTagList<T>>,
  'className'
> & {
  columnCount?: 1 | 2
}

function InternalTagList<
  T extends Record<string, unknown>,
>({ columnCount, ...restProps }: TagListProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  const dataProperties = toDataProperties({ 'column-count': columnCount })

  return (
    <ReactAriaTagList
      {...dataProperties}
      {...restProps}
      className={TAG_CLASS_NAMES.LIST}
      ref={ref}
    />
  )
}

export const TagList = forwardRef(InternalTagList) as <T extends Record<string, unknown>>(
  props: TagListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof InternalTagList>

type TagProps = Omit<
  ComponentProps<typeof ReactAriaTag>,
  'className'
>

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  function Tag(props, ref) {
    return (
      <ReactAriaTag
        {...props}
        className={TAG_CLASS_NAMES.TAG}
        ref={ref}
      />
    )
  },
)
