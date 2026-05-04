import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Feather } from "lucide-react"
import SocialFeedSection from "@/components/social/SocialFeedSection"

export default function Social() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[36px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-sm sm:p-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Feather className="h-3.5 w-3.5" />
              Cộng đồng
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Lan tỏa lòng tốt, kết nối trái tim.
            </h1>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Trải nghiệm không gian thiện nguyện thế hệ mới. Cập nhật nhanh các chiến dịch, kết nối nguồn lực và theo dõi hành trình nhân ái thông qua bảng tin trực quan.
            </p>
          </div>
          <Button asChild className="rounded-full bg-emerald-600 px-6 hover:bg-emerald-700">
            <Link to="/social/create">Viết bài</Link>
          </Button>
        </div>
      </section>

      <div className="mt-8">
        <Tabs defaultValue="campaign" className="gap-6">
          <TabsList variant="line" className="w-full justify-start gap-2 border-b border-emerald-100 pb-2">
            <TabsTrigger value="campaign" className="rounded-full px-4">Bảng tin Nhật ký</TabsTrigger>
            <TabsTrigger value="inkind" className="rounded-full px-4">Trạm kết nối Cho &amp; Nhận</TabsTrigger>
          </TabsList>

          <TabsContent value="campaign" className="mt-6">
            <SocialFeedSection
              feed="campaign"
              title="Bảng tin Nhật ký"
              description="Các bài viết cập nhật chiến dịch, thành quả và hành trình thiện nguyện."
              emptyText="Chưa có bài viết nhật ký nào"
            />
          </TabsContent>

          <TabsContent value="inkind" className="mt-6">
            <SocialFeedSection
              feed="inkind"
              title="Trạm kết nối Cho &amp; Nhận"
              description="Cùng cộng đồng lan tỏa giá trị thông qua việc tặng quà, hỗ trợ hiện vật và đóng góp sức trẻ."
              emptyText="Chưa có bài viết cho & nhận nào"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}