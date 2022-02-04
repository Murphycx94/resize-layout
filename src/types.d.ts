import { DirectionEnum, NodeTypeEnum } from './enums'

interface IMinSize {
  width: number
  height: number
  horizontal: number
  vertical: number
}

interface IData {
  minSize: IMinSize
  nodeId: string
  children: IData[]
  direction: DirectionEnum
  width: number
  height: number
  top?: number
  left?: number
  type: NodeTypeEnum
  component?: string
}

interface ISize {
  height: number
  width: number
}

interface IPosition {
  top?: number
  left?: number
}

interface IDragPosition {
  x: number
  y: number
  xDistance: number
  yDistance: number
}
