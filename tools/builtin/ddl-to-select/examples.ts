import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  {
    name: "Oracle DDL",
    input: "CREATE TABLE T_USER (\n  USER_ID NUMBER,\n  USER_NAME VARCHAR2(100),\n  EMAIL VARCHAR2(200),\n  CREATED_AT DATE,\n  CONSTRAINT PK_T_USER PRIMARY KEY (USER_ID)\n);",
    output: "SELECT\n  USER_ID,\n  USER_NAME,\n  EMAIL,\n  CREATED_AT\nFROM T_USER;"
  },
  {
    name: "COMMENT 字段清单",
    input: "--     month STRING COMMENT 'month'\n--     ,stat_date STRING COMMENT '日期'\n--     ,area_name STRING COMMENT '大区'",
    output: "SELECT\n  month AS \"month\"\n  ,stat_date AS \"日期\"\n  ,area_name AS \"大区\"\nFROM table_name\nWHERE ds >= to_char(date'${dsStart}', 'yyyymmdd')\nAND ds <= to_char(date'${dsEnd}', 'yyyymmdd')"
  }
] satisfies ToolExample<string, string>[]
