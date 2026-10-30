"use client"
import { Toast as BaseToast } from "@base-ui/react/toast"
import { Toast } from "@/components/graphical"
import { X } from "@/components/icons"

export const toastManager = BaseToast.createToastManager()

export interface ToastOptions {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  timeout?: number
  type?: "success" | "error" | "info"
}
export function toast(o: ToastOptions) {
  return toastManager.add({
    title: o.title,
    description: o.description,
    type: o.type ?? "success",
    timeout: o.timeout ?? (o.type === "error" ? 0 : o.action ? 10000 : 5000),
    actionProps: o.action
      ? { children: o.action.label, onClick: o.action.onClick }
      : undefined,
  })
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager()
  return (
    <>
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          toast={t}
          role={t.type === "error" ? "alert" : "status"}
          className="toast-root"
        >
          <Toast.Content>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <Toast.Title className="text-label" />
                <Toast.Description className="text-caption text-muted-foreground" />
              </div>
              <Toast.Close
                aria-label="Dismiss notification"
                className="-m-3 grid size-11 shrink-0 place-items-center rounded-md hover:bg-muted"
              >
                <X className="size-4" aria-hidden="true" />
              </Toast.Close>
            </div>
            {t.actionProps ? (
              <Toast.Action className="self-start max-md:min-h-11" />
            ) : null}
          </Toast.Content>
        </Toast.Root>
      ))}
    </>
  )
}

export function Toaster({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="toast-viewport">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
