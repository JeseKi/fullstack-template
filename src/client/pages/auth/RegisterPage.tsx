import { isAxiosError } from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, Mail, User, UserPlus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Spinner } from '../../components/ui/spinner'

function resolveErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as { detail?: string; message?: string } | undefined
    return payload?.detail ?? payload?.message ?? '注册失败，请稍后再试。'
  }
  if (error instanceof Error) {
    return error.message
  }
  return '注册失败，请稍后再试。'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, isAuthenticated } = useAuth()

  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const validate = () => {
    const nextErrors: typeof fieldErrors = {}
    const username = values.username.trim()
    const email = values.email.trim()
    if (!username) {
      nextErrors.username = '请输入用户名'
    } else if (username.length < 3) {
      nextErrors.username = '用户名至少 3 个字符'
    }
    if (!email) {
      nextErrors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = '请输入正确的邮箱格式'
    }
    if (!values.password) {
      nextErrors.password = '请输入密码'
    } else if (values.password.length < 8) {
      nextErrors.password = '密码至少 8 个字符'
    }
    if (!values.confirmPassword) {
      nextErrors.confirmPassword = '请再次输入密码'
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = '两次输入的密码不一致'
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
    setSubmitting(true)
    try {
      await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      toast.success('注册成功，请登录')
      navigate('/login', { state: { registerSuccess: true } })
    } catch (err) {
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
          <span className="text-sm">正在加载，请稍候</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle>创建新账号</CardTitle>
          <CardDescription>填写基础信息即可体验最新版本的前端模板能力。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <label className="text-sm font-medium">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={values.email}
                  onChange={(event) => {
                    setValues((prev) => ({ ...prev, email: event.target.value }))
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="请输入邮箱地址"
                  autoComplete="email"
                  className="pl-9"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
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
                  autoComplete="new-password"
                  className="pl-9"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(event) => {
                    setValues((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }}
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
                  className="pl-9"
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              <UserPlus className="h-4 w-4" />
              注册
            </Button>
          </form>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">已有账号？</span>
            <Link to="/login" className="font-medium text-primary">
              返回登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
