import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Spin, Flex, Splitter } from "antd";
import {
  useGetThreadQuery,
  useProcessQueryMutation,
  useThreadProgressSubscription,
} from "../graphql/generated/hooks";
import { Visualization } from "../graphql/generated/schemas";
import ThreadPanel from "../components/thread/ThreadPanel";
import ResultsPanel from "../components/results/ResultsPanel";

interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  id: string;
  interactionId?: string;
  rating?: string | null;
}

function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSql, setCurrentSql] = useState<string>("");
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [currentVisualization, setCurrentVisualization] =
    useState<Visualization | null>(null);
  const [currentProgress, setCurrentProgress] = useState<{
    step?: string;
    message?: string;
    percentage?: number;
  }>({});
  const [hasCompletedProgress, setHasCompletedProgress] = useState(false);
  const [isProcessingNewQuery, setIsProcessingNewQuery] = useState(false);
  const [selectedInteractionId, setSelectedInteractionId] = useState<
    string | null
  >(null); // null means latest
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);
  const [selectedLlmProvider, setSelectedLlmProvider] = useState<
    string | undefined
  >(undefined);

  // GraphQL hooks
  const {
    data: threadData,
    loading: threadLoading,
    refetch: refetchThread,
    error: threadError,
  } = useGetThreadQuery({
    variables: { threadId: threadId || "" },
    skip: !threadId,
    errorPolicy: "all", // Allow component to handle errors gracefully
  });

  const [processQuery, { loading: processingNew }] = useProcessQueryMutation();

  // Reset state when threadId changes (handles navigation)
  useEffect(() => {
    if (threadId) {
      setMessages([]);
      setCurrentSql("");
      setCurrentData([]);
      setCurrentVisualization(null);
      setCurrentProgress({});
      setHasCompletedProgress(false);
      setIsProcessingNewQuery(false);
      setSelectedInteractionId(null); // Reset to latest
    }
  }, [threadId]);

  // Set connection ID from thread data
  useEffect(() => {
    if (threadData?.getThread?.connectionId) {
      setSelectedConnectionId(threadData.getThread.connectionId);
    }
  }, [threadData?.getThread?.connectionId]);

  // Progress subscription
  useThreadProgressSubscription({
    variables: { threadId: threadId || "" },
    onData: ({ data }) => {
      if (data?.data?.threadProgress) {
        const progress = data.data.threadProgress;
        if (progress.threadId === threadId) {
          const newProgress = {
            step: progress.step,
            message: progress.message,
            percentage: progress.percentage || undefined,
          };

          setCurrentProgress(newProgress);

          // Check if progress reached 100% and we haven't already handled completion
          if (progress.percentage === 100 && !hasCompletedProgress) {
            setHasCompletedProgress(true);
            setIsProcessingNewQuery(false);
            refetchThread()
              .then(() => {
                setCurrentProgress({});
                setHasCompletedProgress(false);
              })
              .catch((error) => {
                console.error(
                  "Failed to refetch thread after completion:",
                  error
                );
                setHasCompletedProgress(false);
              });
          }
        }
      }
    },
  });

  // Load existing messages and data when thread interactions are available
  useEffect(() => {
    if (threadData?.getThread?.interactions) {
      const interactions = threadData.getThread.interactions;

      // Convert interactions to messages
      const threadMessages: Message[] = [];

      interactions.forEach((interaction) => {
        // Add user message
        threadMessages.push({
          id: `user-${interaction._id}`,
          type: "user",
          content: interaction.userQuery,
          timestamp: interaction.createdAt || new Date().toISOString(),
          interactionId: interaction._id,
        });

        // Add assistant message if response exists
        if (interaction.response) {
          threadMessages.push({
            id: `assistant-${interaction._id}`,
            type: "assistant",
            content: interaction.response,
            timestamp: interaction.updatedAt || new Date().toISOString(),
            interactionId: interaction._id,
            rating: interaction.user_rating,
          });
        }
      });

      // Update messages intelligently to preserve local state during processing
      setMessages((prevMessages) => {
        if (
          prevMessages.length === 0 ||
          threadMessages.length > prevMessages.length
        )
          return threadMessages;
        else return prevMessages;
      });
      setSelectedInteractionId(interactions[interactions.length - 1]._id);
    }
  }, [threadData, threadId, isProcessingNewQuery]);

  useEffect(() => {
    if (threadData?.getThread?.interactions) {
      const interactions = threadData.getThread.interactions;
      const interactionToShow = selectedInteractionId
        ? interactions.find((i) => i._id === selectedInteractionId) // Specific interaction
        : interactions[interactions.length - 1]; // Latest interaction

      if (interactionToShow) {
        setCurrentSql(interactionToShow.sqlResult?.sql || "");
        setCurrentData(interactionToShow.sqlResult?.rows || []);
        setCurrentVisualization(interactionToShow.visualization || null);
      }
    }
  }, [selectedInteractionId]);

  const handleSendMessage = async (message: string) => {
    if (!threadId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Add user message to local state immediately
    setMessages((prev) => [...prev, userMessage]);

    // Reset completion flag when starting new processing
    setHasCompletedProgress(false);
    setIsProcessingNewQuery(true);
    setSelectedInteractionId(null); // Reset to latest when sending new message

    try {
      const result = await processQuery({
        variables: {
          input: {
            query: message,
            locale: "en",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            threadId: threadId,
            connectionId: selectedConnectionId,
            llmProvider: selectedLlmProvider,
          },
        },
      });

      // If we get a new thread ID (shouldn't happen in existing thread), navigate to it
      const newThreadId = result.data?.processQuery?.threadId;
      if (newThreadId && newThreadId !== threadId) {
        navigate(`/thread/${newThreadId}`);
        return;
      }

      // Refetch thread data to get the assistant's response
      await refetchThread();
    } catch (error) {
      console.error("Query failed:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content:
          "Sorry, there was an error processing your query. Please try again.",
        timestamp: new Date().toISOString(),
      };
      // Add error message to local state
      setMessages((prev) => [...prev, errorMessage]);
      setIsProcessingNewQuery(false);
    } finally {
      // Don't reset progress here immediately - let the subscription handle it
      // The isProcessingNewQuery flag will be reset when progress reaches 100%
    }
  };

  const handleViewDetails = (interactionId: string) => {
    setSelectedInteractionId(interactionId);
  };

  const handleConnectionSelect = (connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
  };

  const handleLlmProviderSelect = (provider: string) => {
    setSelectedLlmProvider(provider);
  };

  // Show loading spinner while fetching thread data
  if (threadLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  // Show 2-column layout for existing thread
  return (
    <div
      style={{
        height: "100%",
        borderRadius: 8,
        backgroundColor: "white",
        // padding: 10,
      }}
    >
      <Splitter style={{ height: "100%" }}>
        <Splitter.Panel defaultSize="40%" min="25%">
          <ThreadPanel
            messages={messages}
            threadId={threadId}
            onSendMessage={handleSendMessage}
            loading={processingNew}
            disabled={
              processingNew || !selectedConnectionId || !selectedLlmProvider
            }
            progressStep={currentProgress.step}
            progressMessage={currentProgress.message}
            progressPercentage={currentProgress.percentage}
            showProgress={!!currentProgress.step || processingNew}
            onViewDetails={handleViewDetails}
            selectedInteractionId={selectedInteractionId || undefined}
            selectedConnectionId={selectedConnectionId}
            onConnectionSelect={handleConnectionSelect}
            selectedLlmProvider={selectedLlmProvider}
            onLlmProviderSelect={handleLlmProviderSelect}
          />
        </Splitter.Panel>
        <Splitter.Panel min="35%">
          <ResultsPanel
            sql={currentSql}
            data={currentData}
            visualization={currentVisualization}
            isProcessing={isProcessingNewQuery}
            interactionId={selectedInteractionId || undefined}
          />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
}

export default ThreadPage;
