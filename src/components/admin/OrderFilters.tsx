'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { Input } from '@/components/ui/Input'

interface OrderFiltersProps {
  currentStatus?: string
  currentDate?: string
}

export function OrderFilters({ currentStatus, currentDate }: OrderFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'ALL') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.delete('page') // ページをリセット
    router.push(`?${params.toString()}`)
  }

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (date) {
      params.set('date', date)
    } else {
      params.delete('date')
    }
    params.delete('page') // ページをリセット
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/admin/orders')
  }

  const statusOptions = [
    { value: 'ALL', label: '全てのステータス' },
    { value: 'PENDING', label: '未処理' },
    { value: 'PREPARING', label: '準備中' },
    { value: 'READY', label: '準備完了' },
    { value: 'COMPLETED', label: '受け取り完了' },
    { value: 'CANCELLED', label: 'キャンセル' }
  ]

  // 今日の日付をデフォルトにする
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">フィルタ・検索</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ステータス
          </label>
          <CustomSelect
            value={currentStatus || 'ALL'}
            onChange={(e) => handleStatusChange(e.target.value)}
            options={statusOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            受け取り日
          </label>
          <Input
            type="date"
            value={currentDate || ''}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="w-full"
          >
            フィルタをクリア
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={!currentDate ? "default" : "outline"}
          size="sm"
          onClick={() => handleDateChange('')}
        >
          全期間
        </Button>
        <Button
          variant={currentDate === today ? "default" : "outline"}
          size="sm"
          onClick={() => handleDateChange(today)}
        >
          今日
        </Button>
        <Button
          variant={currentDate === new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] ? "default" : "outline"}
          size="sm"
          onClick={() => handleDateChange(new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0])}
        >
          明日
        </Button>
      </div>
    </div>
  )
}