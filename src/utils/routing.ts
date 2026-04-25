const LAYER_PATH_QUERY_PARAM = 'lrcp'

function toKebabCase(input: string) {
  const segments = input
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) ?? []

  return segments
    .map(segment => segment.toLowerCase())
    .join('-')
}

export function toLayerPathValue(viewName: string, ...subroutes: string[]) {
  return [toKebabCase(viewName), ...subroutes.map(toKebabCase)].join('_')
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

export type Route = string
export function getInitialLayerPathRoute<R extends Route>(block: (viewName: string, segment: string) => R) {
  const layerPathParts = getLayerPathQueryParamParts()

  const [viewName, routeSegment] = layerPathParts
  return block(viewName, routeSegment)
}
