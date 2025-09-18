import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function MainLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Fullstack Template
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900">
              示例模块
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              {user ? `你好，${user.username}` : '未登录'}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
