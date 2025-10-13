import { useCallback, useContext } from 'react'
import { Button } from '../ui/Button/Button'
import { HStack, VStack } from '../ui/Stack/Stack'
import { ExpandableDataTableContext } from '../ExpandableDataTable/ExpandableDataTableProvider'

export const UnifiedReportTableHeader = () => {
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)
  const shouldCollapse = expanded === true
  const onClickExpandOrCollapse = useCallback(() => {
    if (shouldCollapse) {
      setExpanded({})
    }
    else {
      setExpanded(true)
    }
  }, [setExpanded, shouldCollapse])

  return (
    <VStack>
      <HStack justify='space-between' align='center' className='Layer__UnifiedReport__Header' pi='md'>
        <HStack>
          {/** TODO: This is where the date picker will go */}
        </HStack>
        <HStack gap='xs'>
          <Button variant='outlined' onClick={onClickExpandOrCollapse}>
            {shouldCollapse ? 'Collapse All' : 'Expand All'}
          </Button>
          {/** TODO: This is where the download button will go */}
        </HStack>
      </HStack>
    </VStack>
  )
}
