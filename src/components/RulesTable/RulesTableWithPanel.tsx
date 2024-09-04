import React, { RefObject, useContext } from 'react'
import { Button } from '../Button'
import { Header } from '../Container'
import { DataState, DataStateStatus } from '../DataState'
import { View } from '../Journal'
import { Loader } from '../Loader'
import { Panel } from '../Panel'
import { Heading } from '../Typography'
import { RulesTable } from './RulesTable'
import { RulesContext } from '../../contexts/RulesContext'


const COMPONENT_NAME = 'rules'

export const RulesTableWithPanel = ({
  containerRef,
}: {
  view: View
  containerRef: RefObject<HTMLDivElement>
}) => {
  const { data, isLoading, refetch , error, selectedRuleId, addRule } = useContext(RulesContext)  

  return (
    <Panel
      sidebar={
        <div>I AM A RULES FORM</div>
      }
      sidebarIsOpen={Boolean(selectedRuleId)}
      parentRef={containerRef}
    >
      <Header className={`Layer__${COMPONENT_NAME}__header`}>
        <Heading className={`Layer__${COMPONENT_NAME}__title`}>
          {'Rules'}
        </Heading>
        <div className={`Layer__${COMPONENT_NAME}__actions`}>
          <Button onClick={() => addRule()} disabled={isLoading}>
            {'Add Rule'}
          </Button>
        </div>
      </Header>

      {data && <RulesTable view={'desktop'} data={data} />}
   

      {error ? (
        <div className='Layer__table-state-container'>
          <DataState
            status={DataStateStatus.failed}
            title='Something went wrong'
            description='We couldn’t load your data.'
            onRefresh={() => refetch()}
            isLoading={isLoading}
          />
        </div>
      ) : null}

      {(!data || isLoading) && !error ? (
        <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
          <Loader />
        </div>
      ) : null}
    </Panel>
  )
}
