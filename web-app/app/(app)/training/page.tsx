import type { Metadata } from "next"
import TrainingPage from "@/components/training/training-page"

export const metadata: Metadata = { title: "Training" }
export default function Page() {
  return <TrainingPage />
}
