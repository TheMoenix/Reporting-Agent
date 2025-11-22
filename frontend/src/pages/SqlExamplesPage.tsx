import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Popconfirm,
  Tag,
  Tooltip,
  Alert,
  App,
  Row,
  Col,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  DatabaseOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import {
  useGetAllSqlExamplesQuery,
  useAddSqlExampleMutation,
  useSearchSqlExamplesLazyQuery,
} from "../graphql/generated/hooks";
import { SqlExampleType } from "../graphql/generated/schemas";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SqlExampleFormValues {
  question: string;
  sql: string;
  category?: string;
  description?: string;
  databaseSchema?: string;
}

const SqlExamplesPage: React.FC = () => {
  const { message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<SqlExampleType[]>([]);
  const [form] = Form.useForm<SqlExampleFormValues>();
  const [searchForm] = Form.useForm();

  // GraphQL hooks
  const {
    data: sqlExamplesData,
    loading,
    error,
    refetch,
  } = useGetAllSqlExamplesQuery();
  const [addSqlExample, { loading: addingExample }] =
    useAddSqlExampleMutation();
  const [searchSqlExamples, { loading: searching }] =
    useSearchSqlExamplesLazyQuery();

  const sqlExamples = sqlExamplesData?.getAllSqlExamples || [];

  const handleAddExample = async (values: SqlExampleFormValues) => {
    try {
      await addSqlExample({
        variables: {
          question: values.question,
          sql: values.sql,
          category: values.category,
          description: values.description,
          databaseSchema: values.databaseSchema,
        },
      });

      message.success("SQL example added successfully!");
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (err) {
      message.error("Failed to add SQL example. Please try again.");
      console.error("Error adding SQL example:", err);
    }
  };

  const handleSearch = async (values: { query: string; limit?: number }) => {
    try {
      const result = await searchSqlExamples({
        variables: {
          query: values.query,
          limit: values.limit || 10,
        },
      });

      if (result.data?.searchSqlExamples) {
        setSearchResults(result.data.searchSqlExamples);
      }
    } catch (err) {
      message.error("Failed to search SQL examples. Please try again.");
      console.error("Error searching SQL examples:", err);
    }
  };

  const columns = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      width: "25%",
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: "200px", display: "block" }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "SQL",
      dataIndex: "sql",
      key: "sql",
      width: "30%",
      render: (text: string) => (
        <Tooltip title={text}>
          <Text code ellipsis style={{ maxWidth: "250px", display: "block" }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: "10%",
      render: (category: string) =>
        category ? (
          <Tag color="blue">{category}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Schema",
      dataIndex: "database_schema",
      key: "database_schema",
      width: "10%",
      render: (schema: string) =>
        schema ? (
          <Tag color="green">{schema}</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Quality Score",
      dataIndex: "quality_score",
      key: "quality_score",
      width: "10%",
      render: (score: number) =>
        score ? (
          <Tag color={score > 0.8 ? "green" : score > 0.6 ? "orange" : "red"}>
            {(score * 100).toFixed(0)}%
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Usage Count",
      dataIndex: "usage_count",
      key: "usage_count",
      width: "10%",
      render: (count: number) => count || 0,
    },
    {
      title: "Actions",
      key: "actions",
      width: "5%",
      render: (record: SqlExampleType) => (
        <Space>
          <Popconfirm
            title="Are you sure you want to delete this example?"
            onConfirm={() => handleDeleteExample(record.id!)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const searchColumns = [
    ...columns
      .filter((col) => col.key === "sql" || col.key === "question")
      .map((col) => ({
        ...col,
        width: undefined,
      })),
    {
      title: "Similarity",
      dataIndex: "similarity_score",
      key: "similarity_score",
      render: (score: number) =>
        score ? (
          <Tag color={score > 0.8 ? "green" : score > 0.6 ? "orange" : "red"}>
            {(score * 100).toFixed(0)}%
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const handleDeleteExample = (id: string) => {
    // Note: Delete functionality would require a deleteSqlExample mutation
    // which doesn't seem to exist in the current backend schema
    message.info("Delete functionality not yet implemented in backend");
  };

  if (error) {
    return (
      <Alert
        message="Error"
        description="Failed to load SQL examples. Please try again later."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <DatabaseOutlined style={{ marginRight: "8px" }} />
          SQL Examples Management
        </Title>
        <Text type="secondary">
          Manage SQL examples for RAG-based query generation and testing
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                >
                  Add SQL Example
                </Button>
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => setIsSearchModalVisible(true)}
                >
                  Test RAG Search
                </Button>
              </Space>
              <Text type="secondary">Total Examples: {sqlExamples.length}</Text>
            </div>

            <Table
              columns={columns}
              dataSource={sqlExamples}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} examples`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Add SQL Example Modal */}
      <Modal
        title={
          <Space>
            <CodeOutlined />
            Add New SQL Example
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddExample}
          style={{ marginTop: "16px" }}
        >
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <TextArea
              rows={2}
              placeholder="Enter the natural language question..."
            />
          </Form.Item>

          <Form.Item
            name="sql"
            label="SQL Query"
            rules={[{ required: true, message: "Please enter the SQL query" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter the corresponding SQL query..."
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Category">
                <Select
                  placeholder="Select category"
                  allowClear
                  options={[
                    { label: "Basic Queries", value: "basic" },
                    { label: "Joins", value: "joins" },
                    { label: "Aggregations", value: "aggregations" },
                    { label: "Subqueries", value: "subqueries" },
                    { label: "Analytics", value: "analytics" },
                    { label: "Complex", value: "complex" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="databaseSchema" label="Database Schema">
                <Input placeholder="e.g., public, sales, inventory" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={2}
              placeholder="Optional description or notes about this example..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: "24px" }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={addingExample}>
                Add Example
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Search/Test RAG Modal */}
      <Modal
        title={
          <Space>
            <SearchOutlined />
            Test RAG Search
          </Space>
        }
        open={isSearchModalVisible}
        onCancel={() => {
          setIsSearchModalVisible(false);
          searchForm.resetFields();
          setSearchResults([]);
        }}
        footer={null}
        width={1000}
      >
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
          style={{ marginTop: "16px" }}
        >
          <Row gutter={16}>
            <Col span={18}>
              <Form.Item
                name="query"
                label="Search Query"
                rules={[
                  { required: true, message: "Please enter a search query" },
                ]}
              >
                <Input
                  placeholder="Enter a natural language question to test RAG search..."
                  suffix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="limit" label="Result Limit">
                <Select
                  placeholder="Limit"
                  defaultValue={10}
                  options={[
                    { label: "5", value: 5 },
                    { label: "10", value: 10 },
                    { label: "20", value: 20 },
                    { label: "50", value: 50 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: "24px" }}>
            <Button type="primary" htmlType="submit" loading={searching} block>
              Search Examples
            </Button>
          </Form.Item>
        </Form>

        {searchResults.length > 0 && (
          <div>
            <Title level={4}>Search Results ({searchResults.length})</Title>
            <Table
              columns={searchColumns}
              dataSource={searchResults}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}

        {searching && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <div style={{ marginTop: "8px" }}>Searching examples...</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SqlExamplesPage;
