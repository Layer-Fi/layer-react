export type Route = string
export type RouteState<R extends Route> = { route: R }
export type RouteNavigation = Record<string, () => void>
