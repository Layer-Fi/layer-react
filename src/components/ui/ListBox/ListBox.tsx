import {
  type ComponentProps,
  type ForwardedRef,
  forwardRef,
  type Ref,
} from 'react'
import { mergeRefs } from '@react-aria/utils'
import {
  ListBox as ReactAriaListBox,
  ListBoxItem as ReactAriaListBoxItem,
  type ListBoxItemProps as ReactAriaListBoxItemProps,
  type ListBoxProps as ReactAriaListBoxProps,
  ListBoxSection as ReactAriaListBoxSection,
  type ListBoxSectionProps as ReactAriaListBoxSectionProps,
} from 'react-aria-components'

import { useStopClickEventsRefCallback } from '@hooks/ref/useStopClickEventsRef'
import { Header } from '@ui/Typography/Text'

import './listBox.scss'

const LIST_BOX_CLASS_NAME = 'Layer__ListBox'
type ListBoxProps<T extends Record<string, unknown>> = Omit<
  ReactAriaListBoxProps<T>,
  'className'
>

function InternalListBox<
  T extends Record<string, unknown>,
>(props: ListBoxProps<T>, ref: React.ForwardedRef<HTMLDivElement>) {
  return (
    <ReactAriaListBox
      {...props}
      className={LIST_BOX_CLASS_NAME}
      ref={ref}
    />
  )
}

export const ListBox = forwardRef(InternalListBox) as <T extends Record<string, unknown>>(
  props: ListBoxProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReturnType<typeof InternalListBox>

const LIST_BOX_SECTION_CLASS_NAME = 'Layer__ListBoxSection'
type ListBoxSectionProps<T extends Record<string, unknown>> = Omit<
  ReactAriaListBoxSectionProps<T>,
  'className'
>

function InternalListBoxSection<
  T extends Record<string, unknown>,
>(props: ListBoxSectionProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  /*
   * This is a workaround for an issue where a ComboBox closes when clicking on
   * a section.
  */
  const stopClickEventsRef = useStopClickEventsRefCallback()
  const mergedRef = mergeRefs<HTMLDivElement>(stopClickEventsRef, ref)

  return (
    <ReactAriaListBoxSection
      {...props}
      className={LIST_BOX_SECTION_CLASS_NAME}
      ref={mergedRef}
    />
  )
}

export const ListBoxSection = forwardRef(InternalListBoxSection) as <T extends Record<string, unknown>>(
  props: ListBoxSectionProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReturnType<typeof InternalListBoxSection>

export const ListBoxSectionHeader = forwardRef<
  HTMLElementTagNameMap['header'],
  Omit<
    ComponentProps<typeof Header>,
    'slot'
  >
>(
  function ListBoxSectionHeader({ children, ...restProps }, ref) {
    return (
      <Header
        slot='header'
        {...restProps}
        ref={ref}
      >
        {children}
      </Header>
    )
  },
)

const LIST_BOX_ITEM_CLASS_NAME = 'Layer__ListBoxItem'
type ListBoxItemProps<T extends Record<string, unknown>> = Omit<
  ReactAriaListBoxItemProps<T>,
  'className'
>

function InternalListBoxItem<
  T extends Record<string, unknown>,
>(props: ListBoxItemProps<T>, ref?: ForwardedRef<T>) {
  return (
    <ReactAriaListBoxItem
      {...props}
      className={LIST_BOX_ITEM_CLASS_NAME}
      ref={ref}
    />
  )
}

export const ListBoxItem = forwardRef(InternalListBoxItem) as <T extends Record<string, unknown>>(
  props: ListBoxItemProps<T> & { ref?: Ref<T> },
) => ReturnType<typeof InternalListBoxItem>
