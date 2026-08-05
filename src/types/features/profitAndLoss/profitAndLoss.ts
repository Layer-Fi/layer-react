// Shared profit-and-loss contracts, kept here so pure helpers can use them
// without depending on the hook or the chart component that consume them.

export type Scope = 'expenses' | 'revenue'

export type SidebarScope = Scope | undefined

export interface DetailedChartStringOverrides {
  expenseChartHeader?: string
  revenueChartHeader?: string
  revenueToggleLabel?: string
  expenseToggleLabel?: string
}

export interface BreadcrumbItem {
  name: string
  display_name: string
}
