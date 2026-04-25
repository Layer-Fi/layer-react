const LAYER_PATH_QUERY_PARAM = 'lp'

export type Route = string
export type RouteState<R extends Route> = { route: R }
export type RouteNavigation = Record<string, () => void>

function toKebabCase(input: string) {
  const segments = input
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? []

  return segments
    .map(segment => segment.toLowerCase())
    .join('-')
}

export function toLayerPathValue(viewName: string, ...subroutes: string[]) {
  return [toKebabCase(viewName), ...subroutes.map(toKebabCase)].join(':')
}

export function upsertLayerPathQueryParam(viewName: string, ...subroutes: string[]) {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.set(LAYER_PATH_QUERY_PARAM, toLayerPathValue(viewName, ...subroutes))
  window.history.replaceState(window.history.state, '', url.toString())
}

export function getLayerPathQueryParamParts() {
  if (typeof window === 'undefined') return []

  const urlParams = new URLSearchParams(window.location.search)
  const layerPath = urlParams.get(LAYER_PATH_QUERY_PARAM)

  if (!layerPath) return []

  return layerPath
    .split(/[:_]/)
    .map(part => part.trim())
    .filter(Boolean)
}

export function getInitialLayerPathRoute<R extends Route>(
  viewName: string,
  defaultRoute: R,
  isValidRoute: (segment: string) => segment is R,
) {
  const layerPathParts = getLayerPathQueryParamParts()
  const [targetViewName, routeSegment] = layerPathParts

  if (targetViewName !== viewName) return defaultRoute
  if (!routeSegment) return defaultRoute
  if (!isValidRoute(routeSegment)) return defaultRoute

  return routeSegment
}
