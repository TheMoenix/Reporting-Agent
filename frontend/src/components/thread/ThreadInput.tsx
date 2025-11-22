import React, { useState } from "react";
import { Card, Input, Button, Space, Typography, Flex } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface ThreadInputProps {
  onSubmit: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

function ThreadInput({
  onSubmit,
  loading = false,
  disabled = false,
}: ThreadInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;

    onSubmit(input.trim());
    setInput("");
  };

  return (
    <Flex
      style={{ width: "100%", padding: "10px" }}
      align="flex-end"
      gap="small"
    >
      <TextArea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        disabled={disabled}
        style={{
          borderRadius: 8,
          fontSize: "14px",
        }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        loading={loading}
        onClick={handleSubmit}
        disabled={!input.trim() || disabled}
        style={{
          height: "32px",
          borderRadius: 6,
        }}
      />
    </Flex>
  );
}

export default ThreadInput;
