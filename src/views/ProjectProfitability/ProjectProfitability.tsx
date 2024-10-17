import React, { useState } from 'react'
import { Container } from '../../components/Container'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { View as ViewType } from '../../types/general'

type ViewBreakpoint = ViewType | undefined

export interface ProjectsStringOverrides {
  title?: string
}

export interface ProjectProfitabilityProps {
  showTitle?: boolean
  stringOverrides?: ProjectsStringOverrides
}

export const ProjectProfitabilityView = ({
  showTitle,
  stringOverrides,
}: ProjectProfitabilityProps) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>('overview')
  const [view, setView] = useState<ViewBreakpoint>('desktop')

  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

  type ProjectTab = 'overview' | 'transactions' | 'reports'

  return (
    <View title={stringOverrides?.title || ''} showHeader={showTitle}>
      <div className='Layer__component Layer__header__actions'>
        <Toggle
          name='project-tabs'
          options={[
            {
              value: 'overview',
              label: 'Overview',
            },
            {
              value: 'transactions',
              label: 'Transactions',
            },
            {
              value: 'reports',
              label: 'Reports',
            }
          ]}
          selected={activeTab}
          onChange={opt => setActiveTab(opt.target.value as ProjectTab)}
        />
      </div>
      <Container name='project' ref={containerRef}>
        <>Empty container</>
      </Container>
    </View>
  )
}
