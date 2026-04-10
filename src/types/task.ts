export type GridSize = 4 | 9 | 16 | 25 | 49

export interface TaskItem {
  id: string
  text: string
  completed: boolean
  position: number
}

export interface TaskList {
  id: string
  name: string
  size: GridSize
  tasks: TaskItem[]
  createdAt: number
  isDefault?: boolean
}

export interface BingoLine {
  type: 'horizontal' | 'vertical' | 'diagonal'
  index: number
  positions: number[]
}
