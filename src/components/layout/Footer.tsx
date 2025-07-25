export function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-serif font-semibold text-white mb-4">
              ブッチャー丸幸
            </h3>
            <p className="text-gray-300 text-sm">
              新鮮で高品質な精肉をお届けします。<br />
              店舗での受け取りにてご利用ください。
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-white mb-4">
              営業時間
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>月〜金: 9:00-16:30</p>
              <p>土: 8:00-12:00</p>
              <p>日祝: 定休日</p>
              <p className="mt-2 text-red-400">
                ※平日11:00-13:00は受け取り不可
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-white mb-4">
              お支払い方法
            </h4>
            <p className="text-sm text-gray-300">
              店舗での現金払いのみ
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-600">
          <p className="text-center text-sm text-gray-400">
            © 2024 ブッチャー丸幸. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}