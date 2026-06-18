import type { RegisteredTool } from "../tool-runtime/types"
import { tool as tool_0 } from "../../tools/builtin/camel-to-kebab/index"
import { tool as tool_1 } from "../../tools/builtin/ddl-to-select/index"
import { tool as tool_2 } from "../../tools/builtin/dedupe-lines/index"
import { tool as tool_3 } from "../../tools/builtin/excel-compare/index"
import { tool as tool_4 } from "../../tools/builtin/extract-email/index"
import { tool as tool_5 } from "../../tools/builtin/json-format/index"
import { tool as tool_6 } from "../../tools/builtin/json-minify/index"
import { tool as tool_7 } from "../../tools/builtin/kebab-to-camel/index"
import { tool as tool_8 } from "../../tools/builtin/lower-to-upper/index"
import { tool as tool_9 } from "../../tools/builtin/oracle-field-check/index"
import { tool as tool_10 } from "../../tools/builtin/remove-empty-lines/index"
import { tool as tool_11 } from "../../tools/builtin/sort-lines/index"
import { tool as tool_12 } from "../../tools/builtin/trim-lines/index"
import { tool as tool_13 } from "../../tools/builtin/upper-to-lower/index"

export const tools: RegisteredTool[] = [
  tool_0,
  tool_1,
  tool_2,
  tool_3,
  tool_4,
  tool_5,
  tool_6,
  tool_7,
  tool_8,
  tool_9,
  tool_10,
  tool_11,
  tool_12,
  tool_13
]
