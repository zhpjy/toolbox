export const toolSearchIndex = [
  {
    "id": "camel-to-kebab",
    "name": "驼峰转烤串命名",
    "description": "将 camelCase 或 PascalCase 转换为 kebab-case",
    "category": "文本处理",
    "tags": [
      "命名",
      "字符串",
      "前端",
      "kebab-case",
      "camelCase"
    ],
    "aliases": [
      "驼峰转横线",
      "驼峰转短横线",
      "camel to kebab"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "驼峰转烤串命名 将 camelCase 或 PascalCase 转换为 kebab-case 文本处理 命名 字符串 前端 kebab-case camelCase 驼峰转横线 驼峰转短横线 camel to kebab"
  },
  {
    "id": "ddl-to-select",
    "name": "DDL 生成 SELECT",
    "description": "根据 Oracle DDL 或带 COMMENT 的字段清单生成 SELECT 语句",
    "category": "SQL / Oracle",
    "tags": [
      "SQL",
      "DDL",
      "Oracle",
      "SELECT",
      "字段",
      "COMMENT"
    ],
    "aliases": [
      "建表语句转查询",
      "表结构生成查询",
      "字段列表",
      "ddl to select"
    ],
    "inputKind": "sql",
    "outputKind": "text",
    "autoRun": false,
    "text": "DDL 生成 SELECT 根据 Oracle DDL 或带 COMMENT 的字段清单生成 SELECT 语句 SQL / Oracle SQL DDL Oracle SELECT 字段 COMMENT 建表语句转查询 表结构生成查询 字段列表 ddl to select"
  },
  {
    "id": "dedupe-lines",
    "name": "行去重",
    "description": "按行去重，保留每个唯一行的首次出现位置",
    "category": "文本处理",
    "tags": [
      "行处理",
      "去重",
      "文本"
    ],
    "aliases": [
      "unique lines",
      "dedupe lines",
      "删除重复行"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "行去重 按行去重，保留每个唯一行的首次出现位置 文本处理 行处理 去重 文本 unique lines dedupe lines 删除重复行"
  },
  {
    "id": "excel-compare",
    "name": "Excel Compare",
    "description": "对比 Excel Sheet，支持上传、切换 Sheet、编辑、粘贴与高亮 Diff",
    "category": "Excel / 表格",
    "tags": [
      "Excel",
      "XLSX",
      "Diff",
      "表格",
      "Compare"
    ],
    "aliases": [
      "excel diff",
      "xlsx compare",
      "表格对比",
      "sheet diff"
    ],
    "inputKind": "app",
    "outputKind": "app",
    "autoRun": false,
    "text": "Excel Compare 对比 Excel Sheet，支持上传、切换 Sheet、编辑、粘贴与高亮 Diff Excel / 表格 Excel XLSX Diff 表格 Compare excel diff xlsx compare 表格对比 sheet diff"
  },
  {
    "id": "extract-email",
    "name": "提取邮箱",
    "description": "从文本中提取邮箱地址，默认去重并保留首次出现顺序",
    "category": "提取类",
    "tags": [
      "邮箱",
      "Email",
      "正则",
      "文本提取"
    ],
    "aliases": [
      "email extract",
      "提取 email",
      "邮件地址"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "提取邮箱 从文本中提取邮箱地址，默认去重并保留首次出现顺序 提取类 邮箱 Email 正则 文本提取 email extract 提取 email 邮件地址"
  },
  {
    "id": "fields-to-dml-sql",
    "name": "字段转 DML 语句",
    "description": "根据字段名自动推断类型并生成建表 SQL",
    "category": "SQL",
    "tags": [
      "SQL",
      "DML",
      "DDL",
      "建表",
      "字段"
    ],
    "aliases": [
      "字段转SQL",
      "字段转建表语句",
      "fields to sql"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "字段转 DML 语句 根据字段名自动推断类型并生成建表 SQL SQL SQL DML DDL 建表 字段 字段转SQL 字段转建表语句 fields to sql"
  },
  {
    "id": "json-format",
    "name": "JSON 格式化",
    "description": "校验并格式化 JSON，输出缩进后的 JSON 内容",
    "category": "JSON / 编码",
    "tags": [
      "JSON",
      "格式化",
      "pretty",
      "校验"
    ],
    "aliases": [
      "json pretty",
      "json formatter",
      "格式化 json"
    ],
    "inputKind": "json",
    "outputKind": "json",
    "autoRun": false,
    "text": "JSON 格式化 校验并格式化 JSON，输出缩进后的 JSON 内容 JSON / 编码 JSON 格式化 pretty 校验 json pretty json formatter 格式化 json"
  },
  {
    "id": "json-minify",
    "name": "JSON 压缩",
    "description": "校验 JSON 并输出无多余空白的紧凑 JSON 字符串",
    "category": "JSON / 编码",
    "tags": [
      "JSON",
      "压缩",
      "minify",
      "校验"
    ],
    "aliases": [
      "json minify",
      "json compact",
      "压缩 json"
    ],
    "inputKind": "json",
    "outputKind": "text",
    "autoRun": false,
    "text": "JSON 压缩 校验 JSON 并输出无多余空白的紧凑 JSON 字符串 JSON / 编码 JSON 压缩 minify 校验 json minify json compact 压缩 json"
  },
  {
    "id": "kebab-to-camel",
    "name": "烤串转驼峰命名",
    "description": "将 kebab-case 或下划线分隔命名转换为 camelCase",
    "category": "文本处理",
    "tags": [
      "命名",
      "字符串",
      "前端",
      "kebab-case",
      "camelCase"
    ],
    "aliases": [
      "横线转驼峰",
      "短横线转驼峰",
      "kebab to camel"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "烤串转驼峰命名 将 kebab-case 或下划线分隔命名转换为 camelCase 文本处理 命名 字符串 前端 kebab-case camelCase 横线转驼峰 短横线转驼峰 kebab to camel"
  },
  {
    "id": "lower-to-upper",
    "name": "小写转大写",
    "description": "将输入文本全部转换为大写",
    "category": "文本处理",
    "tags": [
      "大小写",
      "字符串",
      "uppercase"
    ],
    "aliases": [
      "转大写",
      "upper case",
      "to upper"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "小写转大写 将输入文本全部转换为大写 文本处理 大小写 字符串 uppercase 转大写 upper case to upper"
  },
  {
    "id": "oracle-field-check",
    "name": "Oracle 字段命名检查",
    "description": "检查 Oracle 字段名是否符合大写下划线命名，并限制长度不超过 30 个字符",
    "category": "SQL / Oracle",
    "tags": [
      "Oracle",
      "字段",
      "命名规范",
      "校验",
      "snake_case"
    ],
    "aliases": [
      "字段规范检查",
      "oracle column check",
      "字段长度检查"
    ],
    "inputKind": "sql",
    "outputKind": "diagnostics",
    "autoRun": false,
    "text": "Oracle 字段命名检查 检查 Oracle 字段名是否符合大写下划线命名，并限制长度不超过 30 个字符 SQL / Oracle Oracle 字段 命名规范 校验 snake_case 字段规范检查 oracle column check 字段长度检查"
  },
  {
    "id": "remove-empty-lines",
    "name": "去空行",
    "description": "删除空行和只包含空白字符的行",
    "category": "文本处理",
    "tags": [
      "行处理",
      "空行",
      "文本"
    ],
    "aliases": [
      "remove empty lines",
      "删除空行"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "去空行 删除空行和只包含空白字符的行 文本处理 行处理 空行 文本 remove empty lines 删除空行"
  },
  {
    "id": "sort-lines",
    "name": "行排序",
    "description": "对输入文本逐行按字典序排序",
    "category": "文本处理",
    "tags": [
      "行处理",
      "排序",
      "文本",
      "sort"
    ],
    "aliases": [
      "sort lines",
      "文本排序"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "行排序 对输入文本逐行按字典序排序 文本处理 行处理 排序 文本 sort sort lines 文本排序"
  },
  {
    "id": "trim-lines",
    "name": "去除每行首尾空格",
    "description": "逐行去除首尾空白，保留原始行顺序",
    "category": "文本处理",
    "tags": [
      "行处理",
      "trim",
      "空格",
      "文本"
    ],
    "aliases": [
      "trim lines",
      "去行首尾空格"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "去除每行首尾空格 逐行去除首尾空白，保留原始行顺序 文本处理 行处理 trim 空格 文本 trim lines 去行首尾空格"
  },
  {
    "id": "upper-to-lower",
    "name": "大写转小写",
    "description": "将输入文本全部转换为小写",
    "category": "文本处理",
    "tags": [
      "大小写",
      "字符串",
      "lowercase"
    ],
    "aliases": [
      "转小写",
      "lower case",
      "to lower"
    ],
    "inputKind": "text",
    "outputKind": "text",
    "autoRun": true,
    "text": "大写转小写 将输入文本全部转换为小写 文本处理 大小写 字符串 lowercase 转小写 lower case to lower"
  }
] as const
