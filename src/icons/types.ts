import { type SVGProps } from 'react'

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: SVGProps<SVGSVGElement>['width']
  arrowColor?: string
  outerCircleColor?: string
}
