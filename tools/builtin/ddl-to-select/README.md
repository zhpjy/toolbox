# DDL 生成 SELECT

支持两种输入：

1. Oracle `CREATE TABLE` DDL，提取表名和字段名，忽略约束。
2. 带 `COMMENT '说明'` 的字段清单，生成 `字段 AS "说明"` 形式的 SELECT，并附带 `ds` 日期条件模板。
