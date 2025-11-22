import React, { useState } from "react";
import { Typography, Button, message as antdMessage, Space } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
  EyeOutlined,
} from "@ant-design/icons";
import MarkdownIt from "markdown-it";
import ProgressIndicator from "../progress/ProgressIndicator";
import { useRateQueryResultMutation } from "../../graphql/generated/hooks";

const { Paragraph } = Typography;

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // Convert '\n' in paragraphs into <br>
});

interface MessageBubbleProps {
  message: {
    type: "user" | "assistant";
    content: string;
    timestamp: string;
    id: string;
  };
  threadId?: string;
  interactionId?: string;
  initialRating?: string | null;
  progress?: {
    step?: string;
    message?: string;
    percentage?: number;
    visible?: boolean;
  };
  onViewDetails?: (interactionId: string) => void;
  isSelected?: boolean;
}

function MessageBubble({
  message,
  threadId,
  interactionId,
  initialRating,
  progress,
  onViewDetails,
  isSelected = false,
}: MessageBubbleProps) {
  const isUser = message.type === "user";
  const [rating, setRating] = useState<boolean | null>(
    initialRating === "helpful"
      ? true
      : initialRating === "unhelpful"
        ? false
        : null
  );
  const [isRatingLoading, setIsRatingLoading] = useState(false);

  const [rateQueryResult] = useRateQueryResultMutation();

  const handleRating = async (isHelpful: boolean) => {
    if (!threadId || !interactionId) {
      antdMessage.error("Thread ID and Interaction ID are required for rating");
      return;
    }

    setIsRatingLoading(true);
    try {
      await rateQueryResult({
        variables: {
          threadId,
          interactionId,
          isHelpful,
        },
      });
      setRating(isHelpful);
      antdMessage.success(
        isHelpful
          ? "Thank you for the positive feedback!"
          : "Thank you for the feedback!"
      );
    } catch (error) {
      console.error("Error rating query result:", error);
      antdMessage.error("Failed to submit rating. Please try again.");
    } finally {
      setIsRatingLoading(false);
    }
  };

  // Render markdown for assistant messages, plain text for user messages
  const renderContent = () => {
    if (isUser) {
      return (
        <Paragraph
          style={{
            marginBottom: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </Paragraph>
      );
    } else {
      // Render as markdown for assistant messages
      const htmlContent = md.render(message.content);
      return (
        <div>
          <div
            style={{
              marginBottom: 0,
              wordBreak: "break-word",
            }}
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          {/* Show progress indicator for assistant messages when processing */}
          {!isUser && progress?.visible && (
            <ProgressIndicator
              step={progress.step}
              message={progress.message}
              percentage={progress.percentage}
              visible={progress.visible}
            />
          )}
          {/* Rating and action buttons for assistant messages */}
          {!isUser && threadId && !progress?.visible && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Space size={8}>
                <Button
                  type={rating === true ? "primary" : "text"}
                  icon={rating === true ? <LikeFilled /> : <LikeOutlined />}
                  size="small"
                  loading={isRatingLoading && rating !== false}
                  onClick={() => handleRating(true)}
                  disabled={rating !== null}
                  style={{
                    color: rating === true ? "#52c41a" : "#8c8c8c",
                    borderColor: rating === true ? "#52c41a" : "transparent",
                  }}
                >
                  Helpful
                </Button>
                <Button
                  type={rating === false ? "primary" : "text"}
                  icon={
                    rating === false ? <DislikeFilled /> : <DislikeOutlined />
                  }
                  size="small"
                  loading={isRatingLoading && rating !== true}
                  onClick={() => handleRating(false)}
                  disabled={rating !== null}
                  style={{
                    color: rating === false ? "#ff4d4f" : "#8c8c8c",
                    borderColor: rating === false ? "#ff4d4f" : "transparent",
                  }}
                >
                  Not helpful
                </Button>
              </Space>

              {/* View Details Button */}
              {interactionId && onViewDetails && (
                <Button
                  type={isSelected ? "primary" : "default"}
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => onViewDetails(interactionId)}
                  color={isSelected ? "primary" : "default"}
                >
                  {isSelected ? "Viewing Details" : "View Details"}
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          minWidth: !isUser && progress?.visible ? "80%" : undefined,
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: isUser ? "#1890ff" : "#52c41a",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {isUser ? "U" : "AI"}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              backgroundColor: isUser ? "#e6f7ff" : "#f6ffed",
              border: `1px solid ${isUser ? "#91d5ff" : "#b7eb8f"}`,
              borderRadius: "12px",
              padding: "12px 16px",
              position: "relative",
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8c8c8c",
                  fontWeight: 500,
                }}
              >
                {isUser ? "You" : "AI Assistant"} •{" "}
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
