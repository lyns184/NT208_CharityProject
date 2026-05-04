export default function RegisterVisualPanel() {
  return (
    <section className="relative hidden md:block md:w-1/2 lg:w-[58%]">
      <img
        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80"
        alt="Cộng đồng cùng tạo tác động"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-sky-300/30 via-blue-700/35 to-blue-900/55" />

      <div className="absolute left-8 top-12">
        <p className="text-5xl font-extrabold tracking-tight text-white drop-shadow">OpenHeart</p>
      </div>

      <div className="absolute bottom-12 left-8 right-8">
        <div className="rounded-2xl border border-white/30 bg-white/20 p-6 text-white shadow-[0_15px_45px_-25px_rgba(15,23,42,0.9)] backdrop-blur-md lg:p-8">
          <p className="mb-5 text-4xl leading-tight font-extrabold">"
            Sức mạnh của cộng đồng nằm ở sự chung tay của mỗi cá nhân.
          "</p>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/90 text-emerald-900">
              ❤
            </div>
            <div>
              <p className="text-sm font-bold">Hành trình nhân ái</p>
              <p className="text-xs text-emerald-100">Kết nối hàng triệu trái tim</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
