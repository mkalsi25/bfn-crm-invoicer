import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
  type Row,
} from "@tanstack/react-table";
import { Fragment, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Download,
  Loader2Icon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { type FormEncType, type FormMethod, useFetcher } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { exportTableToCSV } from "~/lib/csv";
import {
  DataFrame,
  type IDataFrame,
  type SelectorWithIndexFn,
} from "data-forge";
import { flatten } from "flat";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  deleteAction,
  hidePagination = false,
  enableFilter = false,
  csvExport = false,
}: DataTableProps<TData, TValue> & {
  enableFilter?: boolean;
  hidePagination?: boolean;
  deleteAction?: {
    target: Record<string, string>;
    options?: {
      action?: string;
      encType?: FormEncType;
      method?: FormMethod;
    };
  };
  csvExport?:
    | boolean
    | {
        fileName: string;
        transformCSV?: SelectorWithIndexFn<any, number>;
      };
}) {
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 30, //default page size
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const fetcher = useFetcher<{
    data?: Record<string, string>;
    errorMessage?: string;
  }>();

  const isLoading =
    fetcher.state === "loading" || fetcher.state === "submitting";

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  const isDone = fetcher.state === "idle" && fetcher.data != null;

  const isSuccess = isDone && fetcher.data?.data;

  const isError = isDone && fetcher.data?.errorMessage;

  useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
    }

    if (isError) {
      toast.error(isError || "Something goes wrong.");
    }
  }, [isSuccess, setIsOpen, isError, toast]);

  const tableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  const getCSV = () => {
    let df = new DataFrame(data).select((item: any) => {
      if (!item.hasOwnProperty("privateMetadata")) {
        return flatten(item);
      }

      const { privateMetadata, ...remaining } = item;

      const jobProfile = privateMetadata?.jobProfile || {};

      const job = {
        "jobProfile.bio": jobProfile?.bio || "",
        "jobProfile.title": jobProfile?.title || "",
        "jobProfile.location": jobProfile?.location || "",
        "jobProfile.phone-number": jobProfile["phone-number"]
          ? jobProfile["phone-number"]
          : "",
        "jobProfile.network-brief": jobProfile["network-brief"]
          ? jobProfile["network-brief"]
          : "",
        "jobProfile.resume-cv-url": jobProfile["resume-cv-url"]
          ? jobProfile["resume-cv-url"]
          : "",
        "jobProfile.preferred-role": jobProfile["preferred-role"]
          ? jobProfile["preferred-role"]
          : "",
        "jobProfile.portfolio": jobProfile["portfolio-link"]
          ? jobProfile["portfolio-link"]
          : "",
        "jobProfile.open-to-relocation": jobProfile["open-to-relocation"]
          ? jobProfile["open-to-relocation"]
          : false,
      };

      return flatten({ ...remaining, application: job });
    });

    if (typeof csvExport === "object" && csvExport.transformCSV) {
      const transformFn = csvExport.transformCSV;
      df = df.select(transformFn);
    }

    return df.toCSV();
  };

  getCSV();

  return (
    <Fragment>
      <div className="flex justify-between items-center gap-4 py-4">
        <div>
          {enableFilter && (
            <Input
              placeholder="Filter..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>

        <div className="inline-flex items-center gap-4">
          {typeof csvExport === "object" && (
            <Button
              onClick={() => exportTableToCSV(getCSV(), csvExport?.fileName)}
            >
              Export CSV <Download />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto"
                disabled={tableColumns.length === 0}
              >
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {tableColumns.map((column) => {
                const header = column?.columnDef?.header;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof header === "string" ? header : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {deleteAction && (
            <Fragment>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={
                      isLoading ||
                      table.getFilteredSelectedRowModel().rows.length === 0
                    }
                  >
                    Delete {table.getFilteredSelectedRowModel().rows.length}{" "}
                    Selected Rows
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col items-end gap-4">
                    <p>Are you sure you want to delete?</p>
                    <div className="inline-flex items-center gap-4">
                      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                      <Button
                        variant="destructive"
                        disabled={
                          isLoading ||
                          table.getFilteredSelectedRowModel().rows.length === 0
                        }
                        onClick={() =>
                          fetcher.submit(
                            {
                              ...deleteAction.target,
                              ids: table.getFilteredSelectedRowModel().rows.map(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (c: Row<any>) => c?.original?.id as number
                              ),
                            },
                            deleteAction.options
                          )
                        }
                      >
                        Delete
                        {isLoading && <Loader2Icon className="animate-spin" />}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </Fragment>
          )}
        </div>
      </div>
      <div className="rounded-md border overflow-clip">
        <Table>
          <TableHeader className="bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold!">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className=" whitespace-normal">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground italic"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!hidePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {deleteAction && (
              <Fragment>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </Fragment>
            )}
          </div>
          <div className="inline-flex flex-wrap space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>

            <Label className="flex items-center gap-1 px-4">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount().toLocaleString()}
              </strong>
            </Label>

            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon />
            </Button>

            <span className="flex items-center gap-1">
              <Label htmlFor="go-to-page">Go to page:</Label>
              <Input
                type="number"
                min="1"
                max={table.getPageCount()}
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="border px-3 py-1 rounded w-16"
              />
            </span>

            <span className="flex items-center gap-1">
              <Label htmlFor="go-to-page">Page Size:</Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Jump" />
                </SelectTrigger>
                <SelectContent>
                  {[30, 60, 90, 120, 150, 200, 250, 500].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
}
