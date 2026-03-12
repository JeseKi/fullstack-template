# 前端模块概览

## 公开接口
- `App`：应用入口，统一挂载路由与鉴权上下文，并使用 shadcn/ui + Tailwind 提供基础 UI 与主题变量。
- `AuthProvider` / `useAuth` / `RequireAuth`：维护登录态及用户资料，暴露登录、注册、资料更新、登出、改密等公开行为。
- `MainLayout`：受保护区域的骨架布局，内置品牌导航与用户下拉菜单。
- `LoginPage` / `RegisterPage` / `ExamplePage`：分别对接后端认证、注册与示例模块接口，并以 shadcn/ui 组件承载交互流程。
- `lib/auth`、`lib/example`：封装与后端的 HTTP 调用，是所有页面访问后端的唯一入口。

## 业务逻辑
该模块通过 `AuthProvider` 驱动鉴权逻辑和用户状态同步，将登录后的用户数据传递给 `MainLayout` 与各业务页面。登录注册场景以轻量表单状态配合 shadcn/ui 输入与按钮完成校验与反馈，Example 页面组合 `Card`、`Alert` 等组件呈现示例接口的调用能力。消息反馈统一通过 `sonner` 提示，保证响应清晰一致。

## 数据流
```mermaid
graph LR
    A[用户操作] --> B[页面组件 (Login/Register/Example)]
    B --> C[前端校验与状态更新]
    C --> D[lib 层 API 调用]
    D -->|Axios| E[后端服务]
    E --> F[响应体]
    F --> G[AuthProvider/页面状态]
    G --> H[shadcn/ui 组件渲染]
    G --> I[sonner 消息反馈]
```

## 用法示例
```tsx
// 受保护页面中调用后端并使用 sonner 提示
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '../providers/AuthProvider'
import { ping } from '../lib/example'

export function WelcomeSection() {
  const { user } = useAuth()

  const handlePing = async () => {
    const result = await ping()
    toast.success(result)
  }

  return (
    <Button onClick={handlePing}>
      {`欢迎回来，${user?.username ?? '访客'}`}
    </Button>
  )
}
```

## 设计原因
- Tailwind + shadcn/ui 提供可控的设计系统，可在保持轻量的同时快速扩展。
- `MainLayout` 采用自定义导航与 Radix 下拉菜单，确保视觉一致且易于扩展。
- 表单、查询、通知全面迁移到 shadcn/ui 组件，减少样式耦合并提升可维护性。
- 数据交互仍集中在 `lib` 层，便于在不影响 UI 的前提下替换或扩展后端接口，实现前后端解耦。
