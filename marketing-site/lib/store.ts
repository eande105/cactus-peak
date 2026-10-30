"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

/** Tiny sessionStorage-backed store. Flow state (tour, trial, join) lives here so the steps survive route changes. */
export function useSessionState<T>(
  key: string,
  initial: T
): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const subscribe = useCallback(
    (cb: () => void) => {
      window.addEventListener(`store:${key}`, cb)
      return () => window.removeEventListener(`store:${key}`, cb)
    },
    [key]
  )
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(key) ?? ""
      } catch {
        return ""
      }
    },
    () => "\0server"
  )
  const ready = raw !== "\0server"
  const value = useMemo<T>(() => {
    try {
      return raw && raw !== "\0server"
        ? ({ ...initial, ...JSON.parse(raw) } as T)
        : initial
    } catch {
      return initial
    }
  }, [raw, initial])
  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      try {
        const cur = (() => {
          const r = sessionStorage.getItem(key)
          return r ? ({ ...initial, ...JSON.parse(r) } as T) : initial
        })()
        const next = typeof v === "function" ? (v as (p: T) => T)(cur) : v
        sessionStorage.setItem(key, JSON.stringify(next))
      } catch {}
      window.dispatchEvent(new Event(`store:${key}`))
    },
    [key, initial]
  )
  return [value, set, ready]
}

export const isEmail = (v: string) =>
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())
export const digits = (v: string) => v.replace(/\D/g, "")
export const isPhone = (v: string) => digits(v).length === 10
export const isEmailOrPhone = (v: string) => isEmail(v) || isPhone(v)
