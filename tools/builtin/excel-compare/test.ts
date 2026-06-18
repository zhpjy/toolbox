import { describe, expect, it } from "vitest"
import { tool } from "./index"

describe("excel-compare", () => {
  it("registers as an app tool", () => {
    expect(tool.manifest.kind).toBe("app")
    expect(tool.manifest.inputKind).toBe("app")
    expect(tool.manifest.outputKind).toBe("app")
    expect(tool.component).toBeTruthy()
  })
})
