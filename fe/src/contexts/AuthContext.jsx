import { createContext, useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/api/axios"
import { API } from "@/constants/api-endpoints"
import { authApi } from "@/api/auth.api"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const isAuthenticated = !!user
  const isAdmin = user?.role === "ADMIN"

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore error, still clear local state
    }
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
    navigate("/login")
  }, [navigate])

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null)
      navigate("/login")
    }
    window.addEventListener("auth:logout", handler)
    return () => window.removeEventListener("auth:logout", handler)
  }, [navigate])

  // On mount: validate token by fetching profile
  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setIsLoading(false)
      return
    }
    api
      .get(API.USER.PROFILE)
      .then((res) => {
        const payload = res.data?.data || res.data
        setUser(payload.user || payload)
      })
      .catch(() => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const payload = res.data?.data || res.data
    const { accessToken, refreshToken, user: userData } = payload
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    setUser(userData)
    return userData
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    return res.data
  }

  const refreshProfile = async () => {
    const res = await api.get(API.USER.PROFILE)
    const payload = res.data?.data || res.data
    setUser(payload.user || payload)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
