'use client'

import { useState, useEffect } from 'react'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { format, addDays, isWeekend, isSunday, setHours, setMinutes } from 'date-fns'
import { ja } from 'date-fns/locale'

interface PickupTimeSelectProps {
  onTimeChange: (date: Date, time: string) => void
}

export function PickupTimeSelect({ onTimeChange }: PickupTimeSelectProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableTimes, setAvailableTimes] = useState<{ value: string; label: string }[]>([])

  // 利用可能な日付を生成（営業日のみ、7日先まで）
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      
      // 日曜日と祝日は除外（簡易的に日曜日のみチェック）
      if (!isSunday(date)) {
        dates.push({
          value: format(date, 'yyyy-MM-dd'),
          label: format(date, 'M月d日(E)', { locale: ja })
        })
      }
    }
    
    return dates
  }

  // 選択された日付に応じた利用可能時間を生成
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([])
      return
    }

    const date = new Date(selectedDate)
    const isWeekendDay = isWeekend(date)
    const today = new Date()
    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    
    const times = []
    
    if (isWeekendDay && !isSunday(date)) {
      // 土曜日: 8:00-12:00
      for (let hour = 8; hour < 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeDate = setMinutes(setHours(date, hour), minute)
          
          // 今日の場合は現在時刻+2時間後以降のみ
          if (isToday) {
            const minTime = addHours(today, 2)
            if (timeDate < minTime) continue
          }
          
          times.push({
            value: format(timeDate, 'HH:mm'),
            label: format(timeDate, 'HH:mm')
          })
        }
      }
    } else if (!isWeekendDay) {
      // 平日: 9:00-11:00, 13:00-16:30
      // 午前の部
      for (let hour = 9; hour < 11; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeDate = setMinutes(setHours(date, hour), minute)
          
          if (isToday) {
            const minTime = addHours(today, 2)
            if (timeDate < minTime) continue
          }
          
          times.push({
            value: format(timeDate, 'HH:mm'),
            label: format(timeDate, 'HH:mm')
          })
        }
      }
      
      // 午後の部
      for (let hour = 13; hour < 17; hour++) {
        const endMinute = hour === 16 ? 30 : 60
        for (let minute = 0; minute < endMinute; minute += 30) {
          const timeDate = setMinutes(setHours(date, hour), minute)
          
          if (isToday) {
            const minTime = addHours(today, 2)
            if (timeDate < minTime) continue
          }
          
          times.push({
            value: format(timeDate, 'HH:mm'),
            label: format(timeDate, 'HH:mm')
          })
        }
      }
    }
    
    setAvailableTimes(times)
    setSelectedTime('') // 日付が変わったら時間をリセット
  }, [selectedDate])

  // 日付または時間が変更されたときに親コンポーネントに通知
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const pickupDate = new Date(selectedDate)
      pickupDate.setHours(hours, minutes, 0, 0)
      
      onTimeChange(pickupDate, selectedTime)
    }
  }, [selectedDate, selectedTime]) // onTimeChangeを依存配列から除外

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          受け取り日 <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          options={getAvailableDates()}
          placeholder="日付を選択してください"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          受け取り時間 <span className="text-red-500">*</span>
        </label>
        <CustomSelect
          options={availableTimes}
          placeholder={selectedDate ? "時間を選択してください" : "まず日付を選択してください"}
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          disabled={!selectedDate || availableTimes.length === 0}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">
          営業時間・受け取り時間について
        </h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• 月〜金: 9:00-16:30（11:00-13:00は受け取り不可）</li>
          <li>• 土: 8:00-12:00</li>
          <li>• 日祝: 定休日</li>
          <li>• 受け取り希望時間の2時間前まで注文可能</li>
        </ul>
      </div>
    </div>
  )
}

function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date)
  newDate.setHours(newDate.getHours() + hours)
  return newDate
}