import React from "react";
import { Typography, Flex, Col, Row } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { ChartComponent } from "../visualization/ChartComponent";
import { Visualization } from "../../graphql/generated/schemas";

const { Text } = Typography;

interface GraphTabProps {
  visualization?: Visualization | null;
  rawData?: any[];
}

function GraphTab({ visualization, rawData }: GraphTabProps) {
  // If no visualizations data is provided, show placeholder
  if (!visualization) {
    return (
      <Flex vertical justify="center" align="center" style={{ height: "100%" }}>
        <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <Text type="secondary">No available visualizations</Text>
      </Flex>
    );
  }

  return (
    <div style={{ maxHeight: "80vh", padding: "10px", overflow: "auto" }}>
      <Row gutter={[16, 16]} wrap>
        {visualization.graphs.map((graph, index) => (
          <Col
            key={index}
            flex="0 0 900px"
            style={{ minWidth: "900px", maxWidth: "900px" }}
          >
            <ChartComponent graph={graph} data={rawData || []} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default GraphTab;
