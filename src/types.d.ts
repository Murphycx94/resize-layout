import { DirectionEnum, NodeTypeEnum } from './enums'

interface IData {
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
