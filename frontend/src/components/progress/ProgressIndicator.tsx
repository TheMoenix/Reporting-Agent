import React from "react";
import { Progress, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ProgressIndicatorProps {
  step?: string;
  message?: string;
  percentage?: number;
  visible?: boolean;
}

function ProgressIndicator({
  step,
  message,
  percentage,
  visible = false,
}: ProgressIndicatorProps) {
  if (!visible) return null;

  return (
    <div style={{ marginTop: "8px", width: "100%" }}>
      {/* Progress bar with percentage */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
        }}
      >
        <Progress
          percent={percentage || 0}
          status="active"
          strokeColor={{
            "0%": "#108ee9",
            "100%": "#87d068",
          }}
          showInfo={false}
          strokeWidth={3}
          style={{ flex: 1, margin: 0 }}
        />
        {percentage !== undefined && (
          <Text
            style={{
              fontSize: "11px",
              color: "#666",
              minWidth: "30px",
              textAlign: "right",
            }}
          >
            {Math.round(percentage)}%
          </Text>
        )}
      </div>

      {/* Message with loading icon */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <LoadingOutlined
          style={{
            fontSize: "10px",
            color: "#666",
          }}
          spin
        />
        <Text
          style={{
            fontSize: "11px",
            color: "#666",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
          title={message || step || "Processing your request..."}
        >
          {message || step || "Processing your request..."}
        </Text>
      </div>
    </div>
  );
}

export default ProgressIndicator;
