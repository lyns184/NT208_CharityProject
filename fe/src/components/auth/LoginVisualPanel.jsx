export default function LoginVisualPanel() {
  return (
    <section className="relative hidden md:block md:w-1/2 lg:w-[58%]">
      <img
        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80"
        alt="Cộng đồng cùng chung tay"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-slate-900/20 to-slate-100/20" />

      <div className="absolute bottom-12 left-8 right-8">
        <div className="rounded-2xl border border-white/30 bg-white/15 p-6 text-white backdrop-blur-md lg:p-8">
          <p className="mb-5 text-3xl leading-tight font-extrabold">
            "Sự thay đổi thực sự bắt đầu khi chúng ta lấy sự minh bạch làm cầu nối giữa ý định và tác động cộng đồng."
          </p>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              alt="Marcus Thorne"
              className="h-10 w-10 rounded-full border border-emerald-300/80 object-cover"
            />
            <div>
              <p className="text-sm font-bold">Marcus Thorne</p>
              <p className="text-xs text-emerald-200">Giám đốc Tác động Toàn cầu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
