import { isAxiosError } from 'axios'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Zap, PlusCircle, Search } from 'lucide-react'
import * as exampleApi from '../../lib/example'
import type { Item } from '../../lib/types'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { Input } from '../../components/ui/input'

function resolveErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as { detail?: string; message?: string } | undefined
    return payload?.detail ?? payload?.message ?? '请求失败，请稍后再试。'
  }
  if (error instanceof Error) {
    return error.message
  }
  return '请求失败，请稍后再试。'
}

export default function ExamplePage() {
  const [pingLoading, setPingLoading] = useState(false)
  const [pingError, setPingError] = useState<string | null>(null)
  const [pingResult, setPingResult] = useState<string | null>(null)

  const [createName, setCreateName] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdItem, setCreatedItem] = useState<Item | null>(null)

  const [fetchId, setFetchId] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchedItem, setFetchedItem] = useState<Item | null>(null)

  const handlePing = async () => {
    setPingLoading(true)
    setPingError(null)
    try {
      const result = await exampleApi.ping()
      setPingResult(result)
      toast.success('服务正常响应')
    } catch (error) {
      const text = resolveErrorMessage(error)
      setPingError(text)
      setPingResult(null)
      toast.error(text)
    } finally {
      setPingLoading(false)
    }
  }

  const handleCreateItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = createName.trim()
    if (!trimmed) {
      setCreateError('名称不能为空')
      return
    }
    if (trimmed.length < 2) {
      setCreateError('名称至少需要 2 个字符')
      return
    }
    setCreateLoading(true)
    setCreateError(null)
    try {
      const item = await exampleApi.createItem({ name: trimmed })
      setCreatedItem(item)
      setCreateName('')
      toast.success('示例条目创建成功')
    } catch (error) {
      const text = resolveErrorMessage(error)
      setCreateError(text)
      setCreatedItem(null)
      toast.error(text)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleFetchItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = Number.parseInt(fetchId, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
      setFetchError('请输入大于 0 的整数')
      return
    }
    setFetchLoading(true)
    setFetchError(null)
    try {
      const item = await exampleApi.getItem(parsed)
      setFetchedItem(item)
      toast.success('查询成功')
    } catch (error) {
      const text = resolveErrorMessage(error)
      setFetchError(text)
      setFetchedItem(null)
      toast.error(text)
    } finally {
      setFetchLoading(false)
    }
  }

  const statisticValue = useMemo(() => {
    if (pingResult) {
      return '可用'
    }
    if (pingError) {
      return '异常'
    }
    return '待检测'
  }, [pingError, pingResult])

  const statisticColor = statisticValue === '异常' ? 'text-destructive' : 'text-primary'

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>服务健康监控</CardTitle>
            <CardDescription>
              这里会调用后端的 ping 接口，确认服务是否正常运行，并同步展示最新状态。
            </CardDescription>
          </div>
          <Button type="button" onClick={handlePing} disabled={pingLoading}>
            <Zap className="h-4 w-4" />
            {pingLoading ? '检测中' : '发起检测'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">当前服务状态</p>
            <p className={`mt-2 text-2xl font-semibold ${statisticColor}`}>{statisticValue}</p>
          </div>
          {pingError && (
            <Alert className="border-destructive/40 text-destructive">
              <AlertTitle>检测失败</AlertTitle>
              <AlertDescription className="text-destructive">{pingError}</AlertDescription>
            </Alert>
          )}
          {!pingError && pingResult && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
              <AlertTitle>{pingResult}</AlertTitle>
              <AlertDescription className="text-emerald-800">
                后端服务已成功响应请求。
              </AlertDescription>
            </Alert>
          )}
          {!pingError && !pingResult && (
            <Alert>
              <AlertTitle>尚未检测</AlertTitle>
              <AlertDescription>尚未发起检测，请点击上方按钮。</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>创建示例条目</CardTitle>
          <CardDescription>填写名称后提交，将调用后端创建接口并返回新条目的详细信息。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">条目名称</label>
              <Input
                value={createName}
                onChange={(event) => {
                  setCreateName(event.target.value)
                  setCreateError(null)
                }}
                placeholder="例如：现代化前端"
              />
            </div>
            <Button type="submit" disabled={createLoading}>
              <PlusCircle className="h-4 w-4" />
              创建条目
            </Button>
          </form>
          {createError && (
            <Alert className="border-destructive/40 text-destructive">
              <AlertDescription className="text-destructive">{createError}</AlertDescription>
            </Alert>
          )}
          {createdItem && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-medium">创建成功</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">条目 ID</span>
                  <span className="font-semibold text-foreground">{createdItem.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">条目名称</span>
                  <span className="font-semibold text-foreground">{createdItem.name}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>查询示例条目</CardTitle>
          <CardDescription>输入条目 ID 并提交，将带回后端的查询结果，便于快速验证数据。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFetchItem} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">条目 ID</label>
              <Input
                type="number"
                min={1}
                value={fetchId}
                onChange={(event) => {
                  setFetchId(event.target.value)
                  setFetchError(null)
                }}
                placeholder="请输入条目 ID"
              />
            </div>
            <Button type="submit" disabled={fetchLoading}>
              <Search className="h-4 w-4" />
              查询条目
            </Button>
          </form>
          {fetchError && (
            <Alert className="border-destructive/40 text-destructive">
              <AlertDescription className="text-destructive">{fetchError}</AlertDescription>
            </Alert>
          )}
          {fetchedItem && (
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-medium">查询结果</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">条目 ID</span>
                  <span className="font-semibold text-foreground">{fetchedItem.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">条目名称</span>
                  <span className="font-semibold text-foreground">{fetchedItem.name}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
