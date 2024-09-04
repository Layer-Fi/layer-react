import React, { useState } from 'react'
import { useRules } from '../../hooks/useRules'
import { RulesContext } from '../../contexts/RulesContext'
import { Container } from '../Container'
import { TableProvider } from '../../contexts/TableContext'
import { View } from '../View'
import { Loader } from '../Loader'
import { RulesTable } from '../RulesTable'
import { BREAKPOINTS } from '../../config/general'
import { useElementSize } from '../../hooks/useElementSize'

const COMPONENT_NAME = 'rules'

export type View = 'mobile' | 'tablet' | 'desktop'

export interface RulesProps {
  asWidget?: boolean
}

export const Rules = (props: RulesProps) => {
  const RulesContextData = useRules()

  return (
    <RulesContext.Provider value={RulesContextData}>
        <RulesContent {...props} />
    </RulesContext.Provider>
  )
}

const RulesContent = ({
  asWidget,
}: RulesProps) => {
  const [view, setView] = useState<View>('desktop')

  const containerRef = useElementSize<HTMLDivElement>((_a, _b, { width }) => {
    if (width) {
      if (width >= BREAKPOINTS.TABLET && view !== 'desktop') {
        setView('desktop')
      } else if (
        width <= BREAKPOINTS.TABLET &&
        width > BREAKPOINTS.MOBILE &&
        view !== 'tablet'
      ) {
        setView('tablet')
      } else if (width < BREAKPOINTS.MOBILE && view !== 'mobile') {
        setView('mobile')
      }
    }
  })

  return (
    <Container name={COMPONENT_NAME}>
      {/* <TableProvider>
          <View title="Rules">
            {!data || isLoading ? (
              <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
                <Loader />
              </div>
            ) : (
              
            )}
          </View>
      </TableProvider>    */}

      <RulesTable
        view={view}
        containerRef={containerRef}
      /> 
    </Container>
  )
}