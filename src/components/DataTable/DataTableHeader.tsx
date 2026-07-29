import { type ComponentPropsWithoutRef } from 'react'

import { BackButton, type BackButtonProps } from '@ui/Button/BackButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Header } from '@ui/Typography/Text'
import { SearchField, type SearchFieldProps } from '@components/SearchField/SearchField'

import './dataTableHeader.scss'

interface DataTableHeaderProps {
  name: string
  isMobile?: boolean
  slotProps?: {
    SearchField?: SearchFieldProps
    BackButton?: BackButtonProps
    Heading?: Omit<ComponentPropsWithoutRef<typeof Heading>, 'children'>
  }
  slots?: {
    HeaderActions?: React.FC
    HeaderFilters?: React.FC
  }
}

const DataTableHeaderName = ({
  name,
  slotProps = {},
}: Pick<DataTableHeaderProps, 'name'> & {
  slotProps?: Pick<NonNullable<DataTableHeaderProps['slotProps']>, 'BackButton' | 'Heading'>
}) => (
  <HStack align='center' gap='md'>
    {slotProps.BackButton && <BackButton {...slotProps.BackButton} />}
    <Heading size='md' {...slotProps.Heading}>{name}</Heading>
  </HStack>
)

const DesktopDataTableHeader = ({ name, slotProps = {}, slots = {} }: DataTableHeaderProps) => {
  const { HeaderActions, HeaderFilters } = slots

  return (
    <HStack fluid justify='space-between' align='center' gap='xs' className='Layer__DataTableHeader__Header'>
      <HStack pis='md' align='center' gap='xl'>
        <DataTableHeaderName name={name} slotProps={slotProps} />
        {HeaderFilters && <HeaderFilters />}
      </HStack>
      <HStack pie='md' align='center' gap='xs'>
        {slotProps.SearchField && <SearchField {...slotProps.SearchField} />}
        {HeaderActions && <HeaderActions />}
      </HStack>
    </HStack>
  )
}

const MobileDataTableHeader = ({ name, slotProps = {}, slots = {} }: DataTableHeaderProps) => {
  const { HeaderActions, HeaderFilters } = slots

  return (
    <Header className='Layer__DataTableHeader__Mobile'>
      <VStack gap='sm' pbe='md'>
        <HStack fluid justify='space-between' align='center' gap='sm'>
          <DataTableHeaderName name={name} slotProps={slotProps} />
          {HeaderActions && <HeaderActions />}
        </HStack>
        {HeaderFilters && <HeaderFilters />}
        {slotProps.SearchField && <SearchField {...slotProps.SearchField} />}
      </VStack>
    </Header>
  )
}

export const DataTableHeader = ({ isMobile = false, ...restProps }: DataTableHeaderProps) => {
  return isMobile
    ? <MobileDataTableHeader {...restProps} />
    : <DesktopDataTableHeader {...restProps} />
}
