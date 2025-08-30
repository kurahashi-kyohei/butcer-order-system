'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import Image from 'next/image'
import { Button } from './Button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  placeholder?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = '画像を選択',
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || '')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(value || '')
  }, [value])

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // エラー状態をクリア
    setError('')

    // プレビュー用のローカルURL作成
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'アップロードに失敗しました')
      }

      const data = await response.json()
      
      // プレビューURLをクリーンアップしてサーバーのURLを使用
      URL.revokeObjectURL(previewUrl)
      setPreview(data.url)
      onChange(data.url)

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'アップロードに失敗しました'
      setError(errorMessage)
      
      // エラーの場合はプレビューをクリア
      URL.revokeObjectURL(previewUrl)
      setPreview(value || '')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setPreview('')
    setError('')
    onRemove()
    
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      <div className="flex flex-col space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? 'アップロード中...' : (preview ? '画像を変更' : placeholder)}
        </Button>

        {preview && (
          <div className="relative">
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 border relative">
              <Image
                src={preview}
                alt="商品画像プレビュー"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="absolute top-2 right-2"
            >
              削除
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500">
        対応形式: JPEG, PNG, WebP (最大5MB)
      </p>
    </div>
  )
}