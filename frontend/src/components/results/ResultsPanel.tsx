import React, { useState, useEffect } from "react";
import { Tabs, Card, Space, Typography, Badge } from "antd";
import {
  DatabaseOutlined,
  BarChartOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import DataTab from "./DataTab";
import GraphTab from "./GraphTab";
import { Visualization } from "../../graphql/generated/schemas";

const { Text } = Typography;

interface ResultsPanelProps {
  sql?: string;
  data?: any[];
  visualization?: Visualization | null;
  isProcessing?: boolean;
  interactionId?: string;
}

function ResultsPanel({
  sql,
  data,
  visualization,
  isProcessing = false,
  interactionId,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("data");

  // Auto-switch to relevant tab when data becomes available
  useEffect(() => {
    if (sql || (data && data.length > 0)) {
      setActiveTab("data");
    }
  }, [sql, data]);

  const hasData = sql || (data && data.length > 0);
  const hasVisualizations =
    visualization &&
    visualization.shouldVisualize &&
    visualization.graphs.length > 0;
  const hasResults = hasData;

  const tabItems = [
    {
      key: "data",
      label: (
        <Space>
          <DatabaseOutlined />
          <span>Data</span>
          {hasData && (
            <span
              style={{
                backgroundColor: "#52c41a",
                color: "white",
                borderRadius: "10px",
                padding: "0 6px",
                fontSize: "12px",
                minWidth: "18px",
                textAlign: "center",
              }}
            >
              {data?.length || 1}
            </span>
          )}
        </Space>
      ),
      children: <DataTab sql={sql} data={data} interactionId={interactionId} />,
    },
    {
      key: "graph",
      label: (
        <Space>
          <BarChartOutlined />
          <span>Graph</span>
          {hasVisualizations && (
            <span
              style={{
                backgroundColor: "#722ed1",
                color: "white",
                borderRadius: "10px",
                padding: "0 6px",
                fontSize: "12px",
                minWidth: "18px",
                textAlign: "center",
              }}
            >
              {visualization.graphs.length}
            </span>
          )}
        </Space>
      ),
      children: <GraphTab visualization={visualization} rawData={data} />,
    },
  ];

  return (
    <div style={{ flex: 1, overflow: "hidden", height: "100%" }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ height: "100%" }}
        tabBarStyle={{
          paddingLeft: "16px",
        }}
        tabBarExtraContent={
          isProcessing &&
          hasResults && (
            <Badge
              status="processing"
              text={
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  <SyncOutlined spin style={{ marginRight: "4px" }} />
                  Processing new query...
                </Text>
              }
            />
          )
        }
      />
    </div>
  );
}

export default ResultsPanel;
