# 字段转 DML 语句

根据输入字段名自动推断字段类型，并生成建表 SQL。

## 规则

- 跳过空字段和 `nation_code`
- 以 `date` 或 `time` 结尾 → `DATETIME`
- 包含 `_cnt_`、`_count_` 或以 `_cnt` 结尾 → `BIGINT`
- 其他字段 → `STRING`

## 输出

固定输出 `CREATE TABLE IF NOT EXISTS tmp_table ...` 模板，并自动补充：

- `ds STRING COMMENT ''`
- `nation_code STRING COMMENT ''`
- `LIFECYCLE 700`
