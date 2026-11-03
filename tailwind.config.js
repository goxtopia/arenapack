/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Noto Sans CJK SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          '"Fira Code"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        void: '#05070E',
        obsidian: '#0A0E1A',
        panel: '#0F1526',
      },
    },
  },
  plugins: [],
};
