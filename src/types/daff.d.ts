declare module "daff" {
  export class TableView<T = unknown> {
    constructor(data: T[][])
    data: T[][]
    trim(): void
    getData(): T[][]
  }

  export class CompareFlags {
    show_unchanged: boolean
    always_show_header: boolean
    always_show_order: boolean
    never_show_order: boolean
    unchanged_context: boolean
  }

  export class TableDiff<T = unknown> {
    constructor(alignment: unknown, flags: CompareFlags)
    hilite(output: TableView<T>): void
  }

  export function compareTables<T = unknown>(left: TableView<T>, right: TableView<T>): {
    align(): unknown
  }
}
