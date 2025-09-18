import { isAxiosError } from 'axios'
import { type FormEvent, useState } from 'react'
import * as exampleApi from '../../lib/example'
import type { Item } from '../../lib/types'

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
  const [pingResult, setPingResult] = useState<string | null>(null)
  const [pingError, setPingError] = useState<string | null>(null)
  const [pingLoading, setPingLoading] = useState(false)

  const [newItemName, setNewItemName] = useState('')
  const [createdItem, setCreatedItem] = useState<Item | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)

  const [itemIdInput, setItemIdInput] = useState('')
  const [fetchedItem, setFetchedItem] = useState<Item | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)

  const handlePing = async () => {
    setPingLoading(true)
    setPingError(null)
    try {
      const message = await exampleApi.ping()
      setPingResult(message)
    } catch (error) {
      setPingError(resolveErrorMessage(error))
      setPingResult(null)
    } finally {
      setPingLoading(false)
    }
  }

  const handleCreateItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newItemName.trim()) {
      setCreateError('名称不能为空')
      return
    }
    setCreateLoading(true)
    setCreateError(null)
    try {
      const item = await exampleApi.createItem({ name: newItemName.trim() })
      setCreatedItem(item)
      setNewItemName('')
    } catch (error) {
      setCreateError(resolveErrorMessage(error))
      setCreatedItem(null)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleFetchItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = Number(itemIdInput)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setFetchError('请输入有效的正整数 ID')
      return
    }
    setFetchLoading(true)
    setFetchError(null)
    try {
      const item = await exampleApi.getItem(parsed)
      setFetchedItem(item)
    } catch (error) {
      setFetchError(resolveErrorMessage(error))
      setFetchedItem(null)
    } finally {
      setFetchLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">存活检测</h2>
            <p className="text-sm text-slate-600">调用后端的 ping 接口，确认服务是否正常运行。</p>
          </div>
          <button
            type="button"
            onClick={handlePing}
            disabled={pingLoading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pingLoading ? '检测中...' : '发起检测'}
          </button>
        </div>
        <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {pingError && <span className="text-red-600">{pingError}</span>}
          {!pingError && pingResult && <span>{pingResult}</span>}
          {!pingError && !pingResult && <span>尚未发起检测。</span>}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">创建示例条目</h2>
        <p className="mb-4 text-sm text-slate-600">输入名称并提交后，将调用后端创建条目接口，并返回创建结果。</p>
        {createError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {createError}
          </div>
        )}
        <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleCreateItem}>
          <input
            type="text"
            value={newItemName}
            onChange={(event) => setNewItemName(event.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="请输入条目名称"
          />
          <button
            type="submit"
            disabled={createLoading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {createLoading ? '创建中...' : '创建条目'}
          </button>
        </form>
        {createdItem && (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            创建成功，ID：{createdItem.id}，名称：{createdItem.name}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">查询示例条目</h2>
        <p className="mb-4 text-sm text-slate-600">输入条目 ID 并提交后，将调用后端查询接口，返回对应的条目信息。</p>
        {fetchError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {fetchError}
          </div>
        )}
        <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleFetchItem}>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={itemIdInput}
            onChange={(event) => setItemIdInput(event.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="请输入条目 ID"
          />
          <button
            type="submit"
            disabled={fetchLoading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {fetchLoading ? '查询中...' : '查询条目'}
          </button>
        </form>
        {fetchedItem && (
          <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            查询结果：ID {fetchedItem.id}，名称：{fetchedItem.name}
          </div>
        )}
      </section>
    </div>
  )
}
