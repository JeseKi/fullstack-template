# 前端模块概览

## 公开接口
- `App`：组合路由、认证上下文以及页面布局的应用入口。
- `AuthProvider` / `useAuth` / `RequireAuth`：在前端维护登录状态，暴露登录、注册、资料更新、登出等操作。
- `MainLayout`：受保护区域的基础布局，提供导航与登出按钮。
- `LoginPage` / `RegisterPage` / `ExamplePage`：分别对接后端认证与示例模块的公开接口。
- `lib/auth`、`lib/example`：封装与后端交互的 API 调用，供页面与业务组件使用。

## 业务逻辑
该模块承接后端认证与示例条目的能力，通过 AuthProvider 维持令牌与用户资料，利用路由区分公共页面（登录、注册）与受保护页面（示例条目管理）。布局组件负责统一导航与登出，页面组件在用户交互后调用对应的 API 服务，最终推动视图更新。

## 数据流
1. 用户在页面（登录、注册、示例条目）触发操作。
2. 页面通过 `useAuth` 或 API 服务 (`lib/auth`, `lib/example`) 发起请求。
3. `lib/api` 负责统一追加 `Authorization` 头、处理 401 并拉取新令牌。
4. 接口返回的数据被 AuthProvider 或页面组件接收，随后更新本地状态。
5. 状态变化驱动 React 重新渲染，界面展示最新的用户信息或条目内容。

## 用法示例
```tsx
// 受保护的业务组件示例
import { useAuth } from '../providers/AuthProvider'
import { ping } from '../lib/example'

export function WelcomeBanner() {
  const { user } = useAuth()

  const handlePing = async () => {
    const message = await ping()
    console.log(message)
  }

  return (
    <div>
      <div>欢迎回来，{user?.username}</div>
      <button onClick={handlePing}>测试后端</button>
    </div>
  )
}
```

## 设计原因
- AuthProvider 统一管理令牌与用户信息，便于在任意组件中通过上下文访问登录态。
- 所有接口请求集中在 `lib` 层处理，避免页面中散落重复的 axios 配置。
- 路由层面引入 `RequireAuth`，确保受保护页面只会在成功鉴权后渲染，降低业务组件的防御性编程负担。
