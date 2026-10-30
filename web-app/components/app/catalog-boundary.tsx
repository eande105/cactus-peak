"use client"
import type { ReactNode } from "react"
import { type CatalogData, hydrateCatalog } from "@/lib/data/catalog"
import { clearSessionCache } from "@/lib/data/sessions"

// Fills the catalog objects during render, before any child reads them. The rules engine stays synchronous.
export function CatalogBoundary({
  catalog,
  children,
}: {
  catalog: CatalogData
  children: ReactNode
}) {
  hydrateCatalog(catalog)
  clearSessionCache(catalog)
  return children
}
