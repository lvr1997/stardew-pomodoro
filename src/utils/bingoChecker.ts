import type { BingoLine, GridSize } from '@/types/task'

export function checkBingo(completedPositions: number[], gridSize: GridSize): BingoLine[] {
  const bingoLines: BingoLine[] = []
  const gridDimension = Math.sqrt(gridSize)

  for (let row = 0; row < gridDimension; row += 1) {
    const positions = Array.from({ length: gridDimension }, (_, index) => row * gridDimension + index)
    if (positions.every((position) => completedPositions.includes(position))) {
      bingoLines.push({
        type: 'horizontal',
        index: row,
        positions,
      })
    }
  }

  for (let column = 0; column < gridDimension; column += 1) {
    const positions = Array.from({ length: gridDimension }, (_, index) => column + index * gridDimension)
    if (positions.every((position) => completedPositions.includes(position))) {
      bingoLines.push({
        type: 'vertical',
        index: column,
        positions,
      })
    }
  }

  const diagonalA = Array.from({ length: gridDimension }, (_, index) => index * gridDimension + index)
  const diagonalB = Array.from({ length: gridDimension }, (_, index) => (index + 1) * gridDimension - (index + 1))

  if (diagonalA.every((position) => completedPositions.includes(position))) {
    bingoLines.push({
      type: 'diagonal',
      index: 0,
      positions: diagonalA,
    })
  }

  if (diagonalB.every((position) => completedPositions.includes(position))) {
    bingoLines.push({
      type: 'diagonal',
      index: 1,
      positions: diagonalB,
    })
  }

  return bingoLines
}
