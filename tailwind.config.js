/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 暖调质感配色（明暗双主题）
        bg: {
          DEFAULT: '#F5EEE4', // 浅色背景 暖米
          dark: '#16130F',    // 深色背景 暖深黑
        },
        card: {
          DEFAULT: '#FFFFFF', // 浅色卡片
          dark: '#211C16',    // 深色卡片 暖深棕
        },
        ink: {
          DEFAULT: '#2B2520', // 浅色主文字 深棕
          dark: '#F5EEE4',    // 深色主文字 暖米
        },
        muted: {
          DEFAULT: '#7A6F60', // 浅色次文字
          dark: '#A89B8A',    // 深色次文字
        },
        gold: {
          DEFAULT: '#B08D4E', // 浅色强调金
          dark: '#C9A86A',    // 深色强调金 暖金
        },
        line: {
          DEFAULT: '#E5DCD0', // 浅色分割线
          dark: '#2E2820',    // 深色分割线
        },
        // 营养素配色（参考 Apple Fitness+ 三色环）
        carb: '#FF9F40',     // 碳水 暖橙
        protein: '#A6FF4D',  // 蛋白 青绿
        fat: '#FF2D55',      // 脂肪 玫红
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF Pro Display',
          'Inter',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
    },
  },
  plugins: [],
};
