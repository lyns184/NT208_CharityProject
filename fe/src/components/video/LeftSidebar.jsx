import { Link } from "react-router-dom"
import { ArrowLeft, PlaySquare, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function LeftSidebar({ organizers = [] }) {
  return (
    <aside className="hidden h-[100dvh] w-[250px] shrink-0 flex-col border-r border-emerald-100 bg-white lg:flex">
      <div className="border-b border-emerald-100 px-5 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Trang chủ
        </Link>
        <div className="mt-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <PlaySquare className="h-5 w-5" />
          </div>
          <div>
            <p className="font-extrabold text-emerald-950">OpenHeart Video</p>
            <p className="text-xs text-slate-500">Những câu chuyện đang lan tỏa</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <Link
          to="/videos/create"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Đăng video
        </Link>
        <h2 className="px-2 text-xs font-bold uppercase text-slate-500">
          Tổ chức / Cá nhân nổi bật
        </h2>
        <div className="mt-3 space-y-1">
          {organizers.map((organizer) => (
            <Link
              key={organizer._id}
              to={`/profile/${organizer._id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-emerald-50"
            >
              <Avatar className="h-10 w-10 ring-1 ring-emerald-100">
                <AvatarImage src={organizer.avatar} alt={organizer.name} />
                <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-800">
                  {organizer.name?.charAt(0)?.toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {organizer.name || "Người dùng OpenHeart"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {organizer.accountType === "ORGANIZATION" ? "Tổ chức" : "Cá nhân"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
