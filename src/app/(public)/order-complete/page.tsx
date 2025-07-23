import { Suspense } from 'react'
import { OrderCompleteContent } from './OrderCompleteContent'

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  )
}