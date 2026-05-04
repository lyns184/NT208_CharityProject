import { Component } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-4">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Đã xảy ra lỗi</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Ứng dụng gặp sự cố. Vui lòng thử tải lại trang.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Tải lại trang
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
