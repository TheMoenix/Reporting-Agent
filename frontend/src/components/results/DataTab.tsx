import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Badge,
  Tooltip,
  Flex,
  App,
  Select,
} from "antd";
import {
  DatabaseOutlined,
  TableOutlined,
  CopyOutlined,
  DownloadOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useExportToExcelMutation } from "../../graphql/generated/hooks";
import dayjs from "dayjs";
import { TableProps } from "antd/es/table";

const { Text } = Typography;

interface DataTabProps {
  sql?: string;
  data?: any[];
  interactionId?: string;
}

function DataTab({ sql, data, interactionId }: DataTabProps) {
  const { notification } = App.useApp();
  const [exportToExcel, { loading: excelLoading }] = useExportToExcelMutation();
  const [filteredInfo, setFilteredInfo] = useState<Record<string, any>>({});
  const [selectedOperation, setSelectedOperation] = useState<string>("sum");

  const handleClearFilters = () => {
    setFilteredInfo({});
  };

  const handleTableChange: TableProps<any>["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    setFilteredInfo(filters);
  };

  const handleCopySQL = () => {
    if (sql) {
      navigator.clipboard.writeText(sql);
    }
  };

  const handleExport = async () => {
    if (!interactionId) return;
    try {
      const result = await exportToExcel({ variables: { interactionId } });
      if (result.data?.exportToExcel?.url) {
        notification.success({
          message: "Export Ready",
          description: "Your Excel file is ready for download.",
          btn: (
            <Button
              type="primary"
              size="small"
              key={result.data?.exportToExcel?.url}
              onClick={() => {
                if (result.data?.exportToExcel?.url) {
                  window.open(result.data.exportToExcel.url, "_blank");
                  notification.destroy(result.data?.exportToExcel?.url);
                }
              }}
            >
              Download
            </Button>
          ),
        });
      }
    } catch (error) {
      notification.error({
        message: "Export Failed",
        description: "Could not generate the Excel file.",
      });
    }
  };

  // Prepare table data
  const hasData = data && data.length > 0;

  const isDateColumn = (columnName: string) => {
    const lowerKey = columnName.toLowerCase();
    // Check if column name contains 'date' or ends with '_at' (common timestamp pattern)
    return (
      lowerKey.includes("date") ||
      lowerKey.endsWith("_at") ||
      lowerKey.endsWith("_time")
    );
  };

  const isNumericColumn = (key: string, data: any[]) => {
    // Check if all non-null values in the column are numbers
    const values = data
      .map((item) => item[key])
      .filter((v) => v != null && v !== "");
    if (values.length === 0) return false;

    // Check if all values are either numbers or can be converted to numbers
    return values.every((v) => {
      if (typeof v === "number") return true;
      // Try to parse as number if it's a string
      if (typeof v === "string") {
        const parsed = parseFloat(v);
        return !isNaN(parsed) && isFinite(parsed);
      }
      return false;
    });
  };

  const calculateSummary = (key: string, data: any[], operation: string) => {
    const values: number[] = data
      .map((item) => item[key])
      .filter((v) => v != null && v !== "")
      .map((v) => {
        // Convert to number if it's a string
        if (typeof v === "string") {
          const parsed = parseFloat(v);
          return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
        }
        return typeof v === "number" ? v : null;
      })
      .filter((v): v is number => v != null);

    if (values.length === 0) return "-";

    switch (operation) {
      case "sum":
        return values.reduce((acc, val) => acc + val, 0).toFixed(2);
      case "avg":
        return (
          values.reduce((acc, val) => acc + val, 0) / values.length
        ).toFixed(2);
      case "min":
        return Math.min(...values).toFixed(2);
      case "max":
        return Math.max(...values).toFixed(2);
      case "median":
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
          : sorted[mid].toFixed(2);
      case "count":
        return values.length.toString();
      default:
        return "-";
    }
  };

  const isSingleRow = hasData && data.length === 1;

  const columns = hasData
    ? Object.keys(data[0]).map((key, index) => {
        const uniqueValues = Array.from(new Set(data.map((item) => item[key])));
        const isDate = isDateColumn(key);
        const isNumeric = isNumericColumn(key, data);

        const column: any = {
          title: key
            .replaceAll("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          dataIndex: key,
          key: key,
          width:
            index === 0
              ? Math.max(key.length * 12 + 30, 120) // First column: min 150px for dropdown
              : key.length * 12 + 30, // Other columns: calculated width
          ellipsis: true,
          filteredValue: filteredInfo[key] || null,
          fixed: index === 0 ? "left" : undefined, // Freeze first column
          sorter: isSingleRow
            ? undefined
            : (a: any, b: any) => {
                const valA = a[key];
                const valB = b[key];
                if (isDate) {
                  return dayjs(valA).unix() - dayjs(valB).unix();
                }
                if (typeof valA === "number" && typeof valB === "number") {
                  return valA - valB;
                }
                return String(valA).localeCompare(String(valB));
              },
          render: (v: any) => {
            const displayValue = isDate
              ? dayjs(v).format("YYYY-MM-DD HH:mm:ss")
              : v;
            return (
              <Tooltip placement="topLeft" title={displayValue}>
                {displayValue}
              </Tooltip>
            );
          },
        };

        // Add filters only if the number of unique values is manageable and more than 1 row
        if (
          !isSingleRow &&
          uniqueValues.length > 1 &&
          uniqueValues.length <= 20
        ) {
          column.filters = uniqueValues.map((value) => ({
            text: value,
            value: value,
          }));
          column.onFilter = (value: any, record: any) =>
            !record.__isSummary && String(record[key]) === String(value);
        }

        return column;
      })
    : [];

  // Summary operations for dropdown
  const summaryOperations = [
    { value: "sum", label: "Sum" },
    { value: "avg", label: "Average" },
    { value: "min", label: "Minimum" },
    { value: "max", label: "Maximum" },
    { value: "median", label: "Median" },
    { value: "count", label: "Count" },
  ];

  const formatSQL = (query: string) => {
    return query
      .replace(/\s+/g, " ")
      .replace(
        /(SELECT|FROM|WHERE|LEFT JOIN|RIGHT JOIN|GROUP BY|ORDER BY|HAVING|LIMIT)/gi,
        "\n$1"
      )
      .trim();
  };

  const hasActiveFilters = Object.values(filteredInfo).some(
    (value) => value && value.length > 0
  );

  return (
    <Flex vertical style={{ width: "100%", padding: "10px" }} gap="middle">
      {/* SQL Query Section */}
      {sql && (
        <Card
          title={
            <Space>
              <DatabaseOutlined />
              <Text strong>Generated SQL</Text>
            </Space>
          }
          size="small"
          extra={
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopySQL}
            >
              Copy
            </Button>
          }
        >
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "6px",
              overflow: "auto",
              margin: 0,
              fontSize: "12px",
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
              whiteSpace: "pre-wrap",
              height: "20vh",
            }}
          >
            {formatSQL(sql)}
          </pre>
        </Card>
      )}

      {/* Data Results Section */}
      {hasData && (
        <Card
          title={
            <Space>
              <TableOutlined />
              <Text strong>Query Results</Text>
              <Badge
                count={data.length}
                style={{ backgroundColor: "#52c41a" }}
              />
            </Space>
          }
          size="small"
          extra={
            <Space>
              {hasActiveFilters && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              )}
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={excelLoading}
              >
                Export
              </Button>
            </Space>
          }
          styles={{ body: { padding: 0 } }}
        >
          <Table
            dataSource={data.map((row, index) => ({
              ...row,
              key: index,
            }))}
            columns={columns}
            size="small"
            scroll={{ x: "max-content", y: "40vh" }}
            pagination={false}
            onChange={handleTableChange}
            summary={(pageData) => {
              if (!pageData || pageData.length === 0 || isSingleRow)
                return null;

              // Use the filtered data from pageData, but exclude summary rows
              const dataArray = Array.from(pageData).filter(
                (row) => !row.__isSummary
              );
              if (dataArray.length === 0) return null;

              const keys = Object.keys(dataArray[0]).filter(
                (key) => key !== "key"
              );

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row style={{ backgroundColor: "#f0f5ff" }}>
                    {keys.map((key, index) => {
                      if (index === 0) {
                        // First column: dropdown selector
                        return (
                          <Table.Summary.Cell key={key} index={index}>
                            <Select
                              value={selectedOperation}
                              onChange={setSelectedOperation}
                              options={summaryOperations}
                              variant="borderless"
                              style={{ width: "100%" }}
                              size="small"
                            />
                          </Table.Summary.Cell>
                        );
                      } else {
                        // Other columns: calculated values
                        const isNumeric = isNumericColumn(key, dataArray);
                        const value = isNumeric
                          ? calculateSummary(key, dataArray, selectedOperation)
                          : "-";

                        return (
                          <Table.Summary.Cell key={key} index={index}>
                            <Text strong style={{ color: "#1890ff" }}>
                              {value}
                            </Text>
                          </Table.Summary.Cell>
                        );
                      }
                    })}
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />

          <style>
            {`
              .ant-table-summary {
                background-color: #f0f5ff;
                position: sticky;
                bottom: 0;
                z-index: 3;
              }
              .ant-table-summary tr:hover td {
                background-color: #e6f0ff !important;
              }
            `}
          </style>
        </Card>
      )}

      {/* Empty State */}
      {!sql && !hasData && (
        <Card size="small">
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#8c8c8c",
            }}
          >
            <DatabaseOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <Text type="secondary">No data available yet</Text>
          </div>
        </Card>
      )}
    </Flex>
  );
}

export default DataTab;
