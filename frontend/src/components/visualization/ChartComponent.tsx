import React from "react";
import { Card, Typography, Alert, Flex } from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { Text, Title } = Typography;

export interface GraphSpec {
  type: "bar" | "line" | "pie" | "scatter" | "area" | "table";
  title: string;
  config: {
    xAxis?: {
      field: string;
      label: string;
      type?: "category" | "time" | "value";
    };
    yAxis?: {
      field: string;
      label: string;
      type?: "value" | "category";
    };
    series?: Array<{
      field: string;
      label: string;
      color?: string;
    }>;
    groupBy?: string;
    aggregation?: "sum" | "count" | "avg" | "max" | "min";
    colors?: string[];
    showLegend?: boolean;
    showValues?: boolean;
  };
  reasoning?: string;
}

interface ChartComponentProps {
  graph: GraphSpec;
  data: any[];
  height?: number;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({
  graph,
  data,
  height = 300,
}) => {
  const { type, config, title } = graph;

  // Default colors using Ant Design color palette
  const defaultColors = [
    "#1890ff", // Primary blue
    "#52c41a", // Success green
    "#faad14", // Warning yellow
    "#f5222d", // Error red
    "#722ed1", // Purple
    "#fa541c", // Volcano
    "#13c2c2", // Cyan
    "#a0d911", // Lime
    "#eb2f96", // Magenta
    "#2f54eb", // Geek blue
  ];

  const colors = config.colors || defaultColors;

  // Custom tooltip formatter with Ant Design styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card
          size="small"
          style={{
            border: "1px solid #d9d9d9",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Text strong>{`${config.xAxis?.label || "X"}: ${label}`}</Text>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color, margin: "4px 0" }}>
              <Text>{`${entry.dataKey}: ${typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}`}</Text>
            </div>
          ))}
        </Card>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <Alert
          message="No Data"
          description="No data available for visualization"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={config.xAxis?.field || "x"}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
              {config.series?.map((series, index) => (
                <Bar
                  key={series.field}
                  dataKey={series.field}
                  fill={series.color || colors[index % colors.length]}
                  name={series.label}
                  radius={[2, 2, 0, 0]}
                />
              )) || (
                <Bar
                  dataKey={config.yAxis?.field || "value"}
                  fill={colors[0]}
                  name={config.yAxis?.label || undefined}
                  radius={[2, 2, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={config.xAxis?.field || "x"}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
              {config.series?.map((series, index) => (
                <Line
                  key={series.field}
                  type="monotone"
                  dataKey={series.field}
                  stroke={series.color || colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name={series.label}
                />
              )) || (
                <Line
                  type="monotone"
                  dataKey={config.yAxis?.field || "value"}
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name={config.yAxis?.label || undefined}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={config.yAxis?.field || "value"}
                nameKey={config.xAxis?.field || "name"}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(height * 0.3, 120)}
                label={
                  config.showValues
                    ? (entry: any) =>
                        `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`
                    : false
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={config.xAxis?.field || "x"}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.showLegend && <Legend />}
              {config.series?.map((series, index) => (
                <Area
                  key={series.field}
                  type="monotone"
                  dataKey={series.field}
                  stroke={series.color || colors[index % colors.length]}
                  fill={series.color || colors[index % colors.length]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name={series.label}
                />
              )) || (
                <Area
                  type="monotone"
                  dataKey={config.yAxis?.field || "value"}
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name={config.yAxis?.label || undefined}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={config.xAxis?.field || "x"}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <YAxis
                dataKey={config.yAxis?.field || "y"}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: "#d9d9d9" }}
                tickLine={{ stroke: "#d9d9d9" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <Alert
            message="Unsupported Chart Type"
            description={`Chart type "${type}" is not supported`}
            type="error"
            showIcon
          />
        );
    }
  };

  return (
    <Card
      title={
        <Flex vertical>
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: "12px", textTransform: "uppercase" }}
          >
            {type} chart
          </Text>
        </Flex>
      }
      style={{ marginBottom: 16 }}
    >
      {renderChart()}
      {graph.reasoning && (
        <div
          style={{
            marginTop: 16,
            padding: "12px",
            backgroundColor: "#fafafa",
            borderRadius: "6px",
          }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <strong>Why this chart type?</strong> {graph.reasoning}
          </Text>
        </div>
      )}
    </Card>
  );
};
