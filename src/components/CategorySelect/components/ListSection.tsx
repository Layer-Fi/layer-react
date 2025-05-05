import { ReactNode } from 'react'
import { ListBoxSection, ListBoxSectionProps } from 'react-aria-components'

export const ListSection = ({ children, ...props }: { children: ReactNode } & ListBoxSectionProps<HTMLDivElement>) => (
  <ListBoxSection className='Layer__category-select__list-section' {...props}>{children}</ListBoxSection>
)
