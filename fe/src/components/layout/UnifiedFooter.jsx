export default function UnifiedFooter() {
  return (
    <footer className="bg-[#065f46] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-[#a7f3d0] mb-4">Về chúng tôi</h4>
            <p className="text-[#a7f3d0] text-sm">
              Nền tảng gây quỹ thiện nguyện minh bạch, kết nối những tấm lòng hảo tâm với những hoàn cảnh khó khăn.
            </p>
          </div>
          <div>
            <h4 className="text-[#a7f3d0] mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-[#a7f3d0] hover:text-white transition">Trang chủ</a></li>
              <li><a href="/campaigns" className="text-[#a7f3d0] hover:text-white transition">Chiến dịch</a></li>
              <li><a href="/organizers" className="text-[#a7f3d0] hover:text-white transition">Cá nhân & Tổ chức</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#a7f3d0] mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-[#a7f3d0]">
              <li>📧 contact@thiennguyenviet.vn</li>
              <li>📍 Hà Nội, Việt Nam</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#a7f3d0] mb-4">Mạng xã hội</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center hover:bg-[#059669] transition">
                <span>f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center hover:bg-[#059669] transition">
                <span>in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center hover:bg-[#059669] transition">
                <span>yt</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#10B981] pt-8 text-center text-[#a7f3d0] text-sm">
          <p>© {new Date().getFullYear()} OpenHeart. Bản quyền đã được bảo hộ.</p>
        </div>
      </div>
    </footer>
  )
}
