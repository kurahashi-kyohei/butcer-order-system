'use client'

import { useState, useEffect, useRef } from 'react'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface ProductOptionsProps {
  hasUsageOption: boolean
  usageOptions?: string[]
  hasFlavorOption: boolean
  flavorOptions?: string[]
  hasRemarks: boolean
  onOptionsChange: (options: {
    selectedUsage?: string
    selectedFlavor?: string
    remarks?: string
  }) => void
}

export function ProductOptions({
  hasUsageOption,
  usageOptions = [],
  hasFlavorOption,
  flavorOptions = [],
  hasRemarks,
  onOptionsChange
}: ProductOptionsProps) {
  const [selectedUsage, setSelectedUsage] = useState<string>('')
  const [selectedFlavor, setSelectedFlavor] = useState<string>('')
  const [remarks, setRemarks] = useState<string>('')
  const isFirstRender = useRef(true)

  // 用途が変更されたときの処理
  const handleUsageChange = (value: string) => {
    setSelectedUsage(value)
    // 焼肉以外の用途が選択された場合、味付けをなしに設定
    if (value !== '焼肉') {
      setSelectedFlavor('なし')
    } else {
      // 焼肉が選択された場合、味付けをリセット
      setSelectedFlavor('')
    }
  }

  // 味付けが有効かどうかを判定
  const isFlavorEnabled = selectedUsage === '焼肉'

  // 状態が変更されたときに親コンポーネントに通知（初回レンダリングは除く）
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    onOptionsChange({
      selectedUsage: selectedUsage || undefined,
      selectedFlavor: selectedFlavor || undefined,
      remarks: remarks || undefined
    })
  }, [selectedUsage, selectedFlavor, remarks])

  return (
    <div className="space-y-4">
      {hasUsageOption && usageOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            用途 <span className="text-red-500">*</span>
          </label>
          <Select
            options={usageOptions.map(option => ({
              value: option,
              label: option
            }))}
            placeholder="用途を選択してください"
            value={selectedUsage}
            onChange={(e) => handleUsageChange(e.target.value)}
          />
        </div>
      )}

      {hasFlavorOption && flavorOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            味付け {isFlavorEnabled && <span className="text-red-500">*</span>}
          </label>
          <Select
            options={flavorOptions.map(option => ({
              value: option,
              label: option
            }))}
            placeholder={isFlavorEnabled ? "味付けを選択してください" : "用途が焼肉の場合のみ選択可能"}
            value={selectedFlavor}
            onChange={(e) => setSelectedFlavor(e.target.value)}
            disabled={!isFlavorEnabled}
          />
          {!isFlavorEnabled && selectedUsage && (
            <p className="text-xs text-gray-500 mt-1">
              選択された用途（{selectedUsage}）では味付けは「なし」になります
            </p>
          )}
        </div>
      )}

      {hasRemarks && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            備考（任意）
          </label>
          <Textarea
            placeholder="特別な要望があればご記入ください"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  )
}