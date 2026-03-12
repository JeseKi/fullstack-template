import { isAxiosError } from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogIn, Lock, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Spinner } from '../../components/ui/spinner'

function resolveErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as { detail?: string; message?: string } | undefined
    return payload?.detail ?? payload?.message ?? '登录失败，请稍后重试。'
  }
  if (error instanceof Error) {
    return error.message
  }
  return '登录失败，请稍后重试。'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, isAuthenticated } = useAuth()

  const [values, setValues] = useState({ username: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const locationState = location.state as { from?: { pathname?: string }; registerSuccess?: boolean } | undefined
  const registerSuccess = locationState?.registerSuccess ?? false

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const validate = () => {
    const nextErrors: { username?: string; password?: string } = {}
    if (!values.username.trim()) {
      nextErrors.username = '请输入用户名'
    } else if (values.username.trim().length < 3) {
      nextErrors.username = '用户名至少 3 个字符'
    }
    if (!values.password) {
      nextErrors.password = '请输入密码'
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!validate()) {
      return
    }
    console.log('【登录页面】提交数据', { 用户名: values.username })
    setSubmitting(true)
    try {
      await login({ username: values.username.trim(), password: values.password })
      const fromState = locationState
      const redirectPath = fromState?.from?.pathname ?? '/'
      toast.success('欢迎回来')
      navigate(redirectPath, { replace: true })
    } catch (err) {
      console.error('【登录页面】调用登录接口失败', err)
      const text = resolveErrorMessage(err)
      setError(text)
      toast.error(text)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Spinner />
          <span className="text-sm">正在验证登录状态</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle>欢迎回来</CardTitle>
          <CardDescription>输入账号信息以访问现代化的前端模板。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {registerSuccess && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
              <AlertDescription className="text-emerald-800">
                注册成功，请使用新账号登录。
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="border-destructive/40 text-destructive">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={values.username}
                  onChange={(event) => {
                    setValues((prev) => ({ ...prev, username: event.target.value }))
                    setFieldErrors((prev) => ({ ...prev, username: undefined }))
                  }}
                  placeholder="请输入用户名"
                  autoComplete="username"
                  className="pl-9"
                />
              </div>
              {fieldErrors.username && (
                <p className="text-xs text-destructive">{fieldErrors.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={values.password}
                  onChange={(event) => {
                    setValues((prev) => ({ ...prev, password: event.target.value }))
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="pl-9"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              <LogIn className="h-4 w-4" />
              登录
            </Button>
          </form>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">还没有账号？</span>
            <Link to="/register" className="font-medium text-primary">
              立即注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
