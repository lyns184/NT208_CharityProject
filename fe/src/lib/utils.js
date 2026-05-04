import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount) {
  if (amount == null || isNaN(amount)) return "0 VND"
  return amount.toLocaleString("vi-VN") + " VND"
}

export function formatDate(isoString) {
  if (!isoString) return ""
  const d = new Date(isoString)
  return d.toLocaleDateString("vi-VN") + " " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}

export function shortHash(hash, prefixLen = 6, suffixLen = 4) {
  if (!hash || hash.length <= prefixLen + suffixLen + 3) return hash || ""
  return hash.slice(0, prefixLen) + "..." + hash.slice(-suffixLen)
}

export function formatPercent(current, goal) {
  if (!goal || goal === 0) return 0
  return Math.min(Math.round((current / goal) * 100), 100)
}

export function getEtherscanUrl(txHash) {
  const base = import.meta.env.VITE_ETHERSCAN_BASE_URL || "https://sepolia.etherscan.io"
  return `${base.replace(/\/$/, "")}/tx/${txHash}`
}

export function daysRemaining(endDate) {
  if (!endDate) return 0
  const now = new Date()
  const end = new Date(endDate)
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
}
