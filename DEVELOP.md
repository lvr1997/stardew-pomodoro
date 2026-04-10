# Bongo Todo 

## 项目概述

基于现有Vue3项目，开发一个Bingotodo风格的像素风Todo应用，实现Bingo连线完成机制。

## 系统架构

###  1. 核心功能模块

  src/
  ├── components/
  │   ├── BingoTodoGrid.vue      # 主网格组件
  │   ├── TaskItem.vue           # 任务项组件
  │   ├── TaskListManager.vue    # 任务列表管理
  │   └── CreateTaskList.vue     # 新建列表弹窗
  ├── stores/
  │   ├── taskStore.ts           # 任务状态管理
  │   └── bingoStore.ts          # Bingo检测逻辑
  ├── types/
  │   └── task.ts                # 类型定义
  └── utils/
      └── bingoChecker.ts        # Bingo检测算法

###  2. 数据模型

```ts
  // 任务项
  interface TaskItem {
    id: string
    text: string
    completed: boolean
    position: number // 在网格中的位置 0-48 (7x7)
  }

  // 任务列表
  interface TaskList {
    id: string
    name: string
    size: 4 | 9 | 16 | 25 | 49 // 4x4, 3x3, 4x4, 5x5, 7x7
    tasks: TaskItem[]
    createdAt: Date
    isDefault?: boolean
  }

  // Bingo线
  interface BingoLine {
    type: 'horizontal' | 'vertical' | 'diagonal'
    index: number
    positions: number[]
  }
```

## UI/UX 设计规范

  像素风设计原则

  - 配色方案: 使用8-bit 像素风配色
    - 网格背景: #925E2E
    - 任务格: #F6D88D
    - 完成格: #CBA15B
    - 强调色: #D78004
    - 文字: #FFFFFF
  - 字体: 使用像素字体 (Fusion-pixel)

  主界面布局: 5*5 网格

## 核心功能实现

### 1. 网格系统

```vue
  <!-- BingoTodoGrid.vue -->
  <template>
    <div class="grid-container" :style="gridStyle">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :size="cellSize"
        @click="toggleTask(task)"
      />
    </div>
  </template>

  <script setup>
  const props = defineProps<{
    tasks: TaskItem[]
    gridSize: number // 4, 9, 16, 25, 49
  }>()

  const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${Math.sqrt(props.gridSize)}, 1fr)`
  }))
  </script>
```

### 2. Bingo检测算法

```ts
  // bingoChecker.ts
  export function checkBingo(
    completedPositions: number[],
    gridSize: number
  ): BingoLine[] {
    const bingoLines: BingoLine[] = []
    const gridDimension = Math.sqrt(gridSize)

    // 横向检测
    for (let row = 0; row < gridDimension; row++) {
      const positions = Array.from(
        { length: gridDimension },
        (_, i) => row * gridDimension + i
      )
      if (positions.every(pos => completedPositions.includes(pos))) {
        bingoLines.push({
          type: 'horizontal',
          index: row,
          positions
        })
      }
    }

    // 纵向检测
    for (let col = 0; col < gridDimension; col++) {
      const positions = Array.from(
        { length: gridDimension },
        (_, i) => col + i * gridDimension
      )
      if (positions.every(pos => completedPositions.includes(pos))) {
        bingoLines.push({
          type: 'vertical',
          index: col,
          positions
        })
      }
    }

    // 对角线检测
    const diagonal1 = Array.from(
      { length: gridDimension },
      (_, i) => i * gridDimension + i
    )
    const diagonal2 = Array.from(
      { length: gridDimension },
      (_, i) => (i + 1) * gridDimension - (i + 1)
    )

    if (diagonal1.every(pos => completedPositions.includes(pos))) {
      bingoLines.push({
        type: 'diagonal',
        index: 0,
        positions: diagonal1
      })
    }

    if (diagonal2.every(pos => completedPositions.includes(pos))) {
      bingoLines.push({
        type: 'diagonal',
        index: 1,
        positions: diagonal2
      })
    }

    return bingoLines
  }
```

### 3. 任务管理

```ts
  // taskStore.ts
  export const useTaskStore = defineStore('task', () => {
    const taskLists = ref<TaskList[]>([])
    const currentList = ref<TaskList | null>(null)

    // 生成默认7x7任务
    const generateDefaultTasks = (): TaskItem[] => {
      const dailyTasks = [
        '晨跑30分钟', '阅读30分钟', '喝水8杯', '冥想10分钟',
        '学习新技能', '整理房间', '写日记', '做计划',
        '感恩练习', '深呼吸练习', '拉伸运动', '早睡早起',
        '不吃垃圾食品', '记账', '存钱', '联系朋友',
        '家庭时间', '工作专注', '完成任务', '运动',
        '早睡', '早起', '吃早餐', '整理桌面',
        '计划明天', '复盘今天', '学习', '运动',
        '健康饮食', '保持心情', '完成任务', '提高效率'
      ]

      return Array.from({ length: 49 }, (_, i) => ({
        id: `task-${i}`,
        text: dailyTasks[i % dailyTasks.length] + ` #${i + 1}`,
        completed: false,
        position: i
      }))
    }

    // 创建新列表
    const createTaskList = (name: string, size: 4 | 9 | 16 | 25) => {
      const newList: TaskList = {
        id: `list-${Date.now()}`,
        name,
        size,
        tasks: Array.from({ length: size }, (_, i) => ({
          id: `task-${Date.now()}-${i}`,
          text: `任务 ${i + 1}`,
          completed: false,
          position: i
        })),
        createdAt: new Date()
      }

      taskLists.value.push(newList)
      return newList
    }

    // 切换任务完成状态
    const toggleTask = (task: TaskItem) => {
      task.completed = !task.completed
      checkForBingo()
    }

    // 检测Bingo
    const checkForBingo = () => {
      if (!currentList.value) return

      const completedPositions = currentList.value.tasks
        .filter(t => t.completed)
        .map(t => t.position)

      const bingoLines = checkBingo(completedPositions, currentList.value.size)

      if (bingoLines.length > 0) {
        // 触发Bingo动画和提示
        emitBingoEvent(bingoLines)
      }
    }

    return {
      taskLists,
      currentList,
      generateDefaultTasks,
      createTaskList,
      toggleTask
    }
  })
```

## 性能优化

  1. 虚拟滚动: 对于7x7网格，所有元素都在可视区域，无需虚拟滚动
  2. 状态管理: 使用Pinia进行状态管理，避免不必要的重新渲染
  3. 计算属性: 使用computed缓存网格样式和任务状态
  4. 事件委托: 使用事件委托优化网格点击事件

  🎯 交互细节

  1. 点击动画: 任务格点击时触发像素风动画
  2. Bingo提示:
    - 连线动画（使用CSS动画绘制线条）
    - 音效提示（可选）
    - 视觉反馈（格子闪烁）
  3. 拖拽排序: 支持拖拽调整任务顺序
  4. 响应式设计: 移动端适配

## 测试计划

  1. 单元测试: Bingo检测算法
  2. 组件测试: 任务项、网格组件
  3. E2E测试: 完整用户流程
  4. 性能测试: 大规模任务列表

## 部署计划

  1. 开发环境: Vite开发服务器
  2. 构建优化: 代码分割、压缩
  3. 部署: Netlify/Vercel

## 未来功能

  1. 任务分类标签
  2. 成就系统
  3. 数据统计
  4. 云同步
  5. 主题切换


> 这个文档为你提供了完整的开发指南，包括架构设计、核心算法、UI规范和实现细节。你可以根据这个文档开始开发，我会协助你实现具体的功能模块。