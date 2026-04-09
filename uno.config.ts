import { defineConfig, presetIcons, presetMini } from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      primary: '#dc7f02',
      secondary: '#ffe7bb',
      danger: '#dc2626',
      background: '#ffe7bb',
      border: '#662800',
      text: '#5e2c2a',
      'text-muted': '#7b5a47',
      hover: '#e08a16',
      'hover-border': '#7a3500',
      focus: '#e2941e',
      'focus-border': '#8a3d00',
      disabled: '#d7a76d',
      'disabled-border': '#a66d3a'
    },
    fontSize: {
      xs: '.75rem',
      sm: '.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    spacing: {
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem'
    }
  },
  shortcuts: {
    'btn': 'p-2 bg-primary text-text rounded-sm border-2 border-solid border-border shadow-md hover:bg-hover hover:border-hover-border focus:outline-none focus:bg-focus focus:border-focus-border disabled:bg-disabled disabled:border-disabled-border disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60',
    'input-base': 'cursor-pointer rounded-sm border-2 border-solid border-border bg-primary text-text text-left hover:bg-hover hover:border-hover-border focus:outline-none focus:bg-focus focus:border-focus-border disabled:bg-disabled disabled:border-disabled-border disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm',
    'panel': 'rounded-sm border-2 border-solid border-border bg-secondary overflow-hidden',
    'panel-header': 'py-3 px-4 border-border',
    'panel-content': 'flex-1 overflow-y-auto p-3'
  },
  presets: [
    presetMini(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ]
})
