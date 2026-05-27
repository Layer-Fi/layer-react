import type { ReactNode } from 'react'

import type { ReportConfig, ReportGroup } from '@schemas/reports/reportConfig'
import type {
  FlatNestedNavigationGroupConfig,
  Key,
  NestedNavigationLeafConfig,
  RecursiveNestedNavigationGroupConfig,
} from '@components/NestedNavigation/types'

export const isReportGroup = (item: ReportGroup | ReportConfig): item is ReportGroup =>
  'reports' in item

type SharedReportGroupConfig = {
  getId: (group: ReportGroup) => Key
  getTextValue: (group: ReportGroup) => string
  getChildren: (group: ReportGroup) => Iterable<ReportConfig>
}

const sharedReportGroupConfig: SharedReportGroupConfig = {
  getId: group => group.groupType,
  getTextValue: group => group.displayName,
  getChildren: group => group.reports,
}

export const buildRecursiveReportsGroupConfig = (
  renderLabel: (group: ReportGroup) => ReactNode,
): RecursiveNestedNavigationGroupConfig<ReportGroup, ReportConfig> => ({
  ...sharedReportGroupConfig,
  isRecursive: true,
  renderLabel,
})

export const buildFlatReportsGroupConfig = (
  renderLabel: (group: ReportGroup) => ReactNode,
): FlatNestedNavigationGroupConfig<ReportGroup, ReportConfig> => ({
  ...sharedReportGroupConfig,
  isRecursive: false,
  renderLabel,
})

export const buildReportsLeafConfig = (
  onSelectLeaf: (report: ReportConfig) => void,
  renderLabel: (report: ReportConfig) => ReactNode,
): NestedNavigationLeafConfig<ReportConfig> => ({
  getId: leaf => leaf.key,
  getTextValue: leaf => leaf.displayName,
  renderLabel,
  onSelectLeaf,
})
