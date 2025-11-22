import React, { useEffect } from "react";
import { Select, Space, Typography, Spin } from "antd";
import { useGetAvailableLlMsQuery } from "../../graphql/generated/hooks";

const { Text } = Typography;

interface LLMSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

function LLMSelector({ value, onChange }: LLMSelectorProps) {
  const { data, loading, error } = useGetAvailableLlMsQuery();

  useEffect(() => {
    if (!value && data?.getAvailableLLMs && data.getAvailableLLMs.length > 0) {
      const firstAvailableLLM = data.getAvailableLLMs.find(
        (llm) => llm.isAvailable
      );
      if (firstAvailableLLM) {
        onChange(firstAvailableLLM.id);
      }
    }
  }, [data, value, onChange]);

  if (loading) {
    return (
      <Space>
        <Spin size="small" />
        <Text type="secondary">Loading LLMs...</Text>
      </Space>
    );
  }

  if (error || !data?.getAvailableLLMs || data.getAvailableLLMs.length === 0) {
    return (
      <Text type="secondary">
        {error ? "Failed to load LLMs" : "No LLMs available"}
      </Text>
    );
  }

  const llms = data.getAvailableLLMs.filter((llm) => llm.isAvailable);

  return (
    <Select
      value={value || llms[0]?.id}
      onChange={onChange}
      style={{ minWidth: 200 }}
      placeholder="Select LLM"
      options={llms.map((llm) => ({
        label: llm.name,
        value: llm.id,
        disabled: !llm.isAvailable,
      }))}
    />
  );
}

export default LLMSelector;
