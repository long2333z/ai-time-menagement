# AI Time Manager

An AI-powered time management application that helps you plan your day and review your progress in just 2 minutes using voice input.

## 📚 文档

完整文档请查看 **[docs 文件夹](./docs/)**

- 🚀 [用户指南](./docs/guides/) - 快速上手和使用说明
- 🚢 [部署文档](./docs/deployment/) - 服务器部署和生产环境配置
- 💻 [开发文档](./docs/development/) - 开发者参考和集成指南
- 🔧 [修复日志](./docs/fix-logs/) - 问题修复和改进记录

**推荐新用户从这里开始**: [START_HERE.md](./docs/guides/START_HERE.md)

## Features

- 🎤 **Voice Planning**: Plan your day in 2 minutes with natural voice input
- 📊 **Analytics Dashboard**: Track your productivity and time usage
- 🎯 **Goals & Habits**: Set and track long-term goals and daily habits
- 💡 **AI Insights**: Get personalized recommendations to optimize your time
- 📅 **Calendar Integration**: Sync with Google, Apple, and Outlook calendars
- 🌙 **Evening Review**: Reflect on your day with voice-powered review
- 📈 **Progress Tracking**: Visualize your productivity trends

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Framework**: Ant Design
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: ECharts
- **Routing**: React Router v6
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ai-time-management
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## Project Structure

```
ai-time-management/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   ├── services/       # API and business logic
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── tailwind.config.js  # Tailwind config
```

## MVP Scope

This is an MVP (Minimum Viable Product) implementation focusing on:

- ✅ Core UI and navigation
- ✅ Basic page structure
- ⏳ Voice input functionality (in progress)
- ⏳ AI task parsing (simulated)
- ⏳ Local data storage
- ⏳ Analytics and insights

### Out of Scope for MVP

- Real AI model integration (OpenAI/Anthropic)
- Backend server and database
- User authentication
- Real payment integration
- Native mobile apps
- Real calendar API integration

## 📖 更多文档

### 快速链接
- [快速启动指南](./docs/guides/快速启动指南.md) - 5 分钟本地运行（中文）
- [Quick Start Guide](./docs/guides/QUICK_START.md) - Quick start (English)
- [AI 功能指南](./docs/guides/AI_CHAT_GUIDE.md) - 了解 AI 聊天功能
- [部署快速开始](./docs/deployment/DEPLOY_QUICK_START.md) - 生产环境部署
- [前后端集成](./docs/development/FRONTEND_BACKEND_INTEGRATION_GUIDE.md) - 开发者指南

### 完整文档索引
查看 [docs/README.md](./docs/README.md) 获取完整的文档列表和推荐阅读路径。

## License

MIT

## Contact

For questions or feedback, please open an issue on GitHub.
