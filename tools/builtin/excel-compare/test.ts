import { describe, expect, it } from "vitest"
import { tool } from "./index"
import { buildDiff } from "./ExcelCompareApp"
import { getModifyCellBackgroundColor } from "./modifyCellColor"

describe("excel-compare", () => {
  it("registers as an app tool", () => {
    expect(tool.manifest.kind).toBe("app")
    expect(tool.manifest.inputKind).toBe("app")
    expect(tool.manifest.outputKind).toBe("app")
    expect(tool.component).toBeTruthy()
  })

  it("keeps three rows of unchanged context around a difference", () => {
    const left = [["header"], ["a"], ["b"], ["c"], ["d"], ["e"]]
    const right = [["header"], ["a"], ["changed"], ["c"], ["d"], ["e"]]

    expect(buildDiff(left, right).data).toHaveLength(8)
  })

  it("uses darker colors for larger numeric changes", () => {
    expect(getModifyCellBackgroundColor("100->101")).not.toBe(getModifyCellBackgroundColor("100->300"))
  })
})
