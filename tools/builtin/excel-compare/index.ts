import { lazy } from "react"
import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

const ExcelCompareApp = lazy(() => import("./ExcelCompareApp"))

export const tool = {
  manifest,
  examples,
  component: ExcelCompareApp,
  run() {
    return null
  }
} satisfies Tool<string, null>
