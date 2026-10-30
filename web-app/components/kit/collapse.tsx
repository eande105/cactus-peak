"use client"
import { type ReactNode, useEffect, useState } from "react"

// Height and opacity animate in and out on the large motion token (300 ms, see globals.css). Reduced motion shortens the
// animation to nothing through the global rule. The last content stays mounted while it leaves.
export function Collapse({
  show,
  children,
}: {
  show: boolean
  children: ReactNode
}) {
  const [st, setSt] = useState({ show, mounted: show, content: children })
  if (st.show !== show || (show && st.content !== children))
    setSt({ show, mounted: true, content: show ? children : st.content })
  useEffect(() => {
    if (show) return
    const t = setTimeout(
      () => setSt((s) => (s.show ? s : { ...s, mounted: false })),
      300
    )
    return () => clearTimeout(t)
  }, [show])
  if (!st.mounted) return null
  return (
    <div className={show ? "collapse-in" : "collapse-out"}>
      <div className="min-h-0 overflow-hidden">{st.content}</div>
    </div>
  )
}
