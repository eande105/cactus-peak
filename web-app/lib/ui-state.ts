"use client"
import { useSyncExternalStore } from "react"

// Small UI-only flags that are not part of the saved member data.
let offlineForced = false
const subs = new Set<() => void>()
const emit = () =>
  subs.forEach((s) => {
    s()
  })
export function setOfflineDemo(v: boolean) {
  offlineForced = v
  emit()
}
export function useOffline() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      window.addEventListener("online", cb)
      window.addEventListener("offline", cb)
      return () => {
        subs.delete(cb)
        window.removeEventListener("online", cb)
        window.removeEventListener("offline", cb)
      }
    },
    () => offlineForced || !navigator.onLine,
    () => false
  )
}
export function isOfflineNow() {
  return (
    offlineForced || (typeof navigator !== "undefined" && !navigator.onLine)
  )
}

// The member's location is read only after they press "Use my location". It is never stored.
let coords: { lat: number; lng: number } | null = null
export function setCoords(c: { lat: number; lng: number } | null) {
  coords = c
  emit()
}
export function useCoords() {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => coords,
    () => null
  )
}
export function miles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 3958.8
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// Global dialogs that can open from anywhere (notification actions, banners, command menu).
type DialogName =
  | "approve"
  | "card"
  | "pass"
  | "command"
  | "feedback"
  | "shortcuts"
  | "guest"
  | "askParent"
const dialogs: Record<DialogName, unknown> = {
  approve: false,
  card: false,
  pass: false,
  command: false,
  feedback: false,
  shortcuts: false,
  guest: false,
  askParent: false,
}
const dsubs = new Set<() => void>()
let version = 0
export function openDialog(name: DialogName, payload: unknown = true) {
  dialogs[name] = payload
  version++
  dsubs.forEach((s) => {
    s()
  })
}
export function closeDialog(name: DialogName) {
  dialogs[name] = false
  version++
  dsubs.forEach((s) => {
    s()
  })
}
export function useDialog<T = unknown>(name: DialogName): T | false {
  useSyncExternalStore(
    (cb) => {
      dsubs.add(cb)
      return () => dsubs.delete(cb)
    },
    () => version,
    () => 0
  )
  return dialogs[name] as T | false
}
