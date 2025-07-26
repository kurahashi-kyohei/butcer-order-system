'use client'

import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface CustomSelectProps {
  options: { value: string; label: string }[]
  placeholder?: string
  value?: string
  onChange?: (event: { target: { value: string } }) => void
  disabled?: boolean
  error?: string
  className?: string
}

export function CustomSelect({
  options,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  const handleOptionClick = (optionValue: string) => {
    if (onChange) {
      onChange({ target: { value: optionValue } })
    }
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="w-full" ref={selectRef}>
      <div className="relative">
        <button
          type="button"
          className={clsx(
            'flex h-12 sm:h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm text-left ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-500',
            isOpen && 'ring-2 ring-red-500 border-red-500',
            className
          )}
          onClick={handleToggle}
          disabled={disabled}
          aria-expanded={isOpen}
        >
          <span className="flex-1 truncate">
            {selectedOption ? selectedOption.label : placeholder || '選択してください'}
          </span>
          <svg
            className={clsx(
              'ml-2 h-5 w-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(
                  'w-full px-4 py-3 text-left text-base hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors',
                  value === option.value && 'bg-red-50 text-red-700 font-medium'
                )}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}