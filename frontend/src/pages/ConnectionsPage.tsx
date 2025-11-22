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
  Switch,
  Typography,
  Popconfirm,
  Tag,
  Tooltip,
  Alert,
  App,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import {
  useGetConnectionsQuery,
  useCreateConnectionMutation,
  useUpdateConnectionMutation,
  useDeleteConnectionMutation,
  useTestConnectionLazyQuery,
  useGetAvailableConnectionTypesQuery,
} from "../graphql/generated/hooks";
import {
  Connection,
  CreateConnectionDto,
  UpdateConnectionDto,
  DatabaseType,
} from "../graphql/generated/schemas";

const { Title, Text } = Typography;

interface ConnectionFormValues {
  name: string;
  description?: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  authDatabase?: string;
  connectionUri?: string;
  isActive: boolean;
}

function ConnectionsPage() {
  const { message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(
    null
  );
  const [form] = Form.useForm<ConnectionFormValues>();
  const [lastError, setLastError] = useState<string | null>(null);
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(
    null
  );
  const [deletingConnectionId, setDeletingConnectionId] = useState<
    string | null
  >(null);

  // GraphQL hooks
  const {
    data: connectionsData,
    loading: connectionsLoading,
    refetch: refetchConnections,
  } = useGetConnectionsQuery();

  const [createConnection, { loading: creating }] =
    useCreateConnectionMutation();
  const [updateConnection, { loading: updating }] =
    useUpdateConnectionMutation();
  const [deleteConnection] = useDeleteConnectionMutation();
  const [testConnection] = useTestConnectionLazyQuery();

  const connections = connectionsData?.connections || [];

  const handleAddConnection = () => {
    setEditingConnection(null);
    setLastError(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, port: 5432 }); // Default values
    setIsModalVisible(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection);
    setLastError(null);
    form.setFieldsValue({
      name: connection.name,
      description: connection.description || "",
      type: connection.type,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      isActive: connection.isActive,
      password: "", // Don't populate password for security
    });
    setIsModalVisible(true);
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnectionId(connectionId);
    try {
      const result = await testConnection({
        variables: { id: connectionId },
      });

      if (result.data?.testConnection.success) {
        const successMessage =
          result.data.testConnection.message || "Connection successful!";
        message.success(successMessage);
      } else {
        const errorMsg =
          result.data?.testConnection.error || "Connection test failed";
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Test connection error:", error);

      let errorMessage = "Failed to test connection";
      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error?.networkError?.message) {
        errorMessage = error.networkError.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    } finally {
      setTestingConnectionId(null);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    setDeletingConnectionId(connectionId);
    try {
      await deleteConnection({
        variables: { id: connectionId },
      });
      message.success("Connection deleted successfully");
      refetchConnections();
    } catch (error: any) {
      console.error("Delete connection error:", error);

      let errorMessage = "Failed to delete connection";
      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error?.networkError?.message) {
        errorMessage = error.networkError.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    } finally {
      setDeletingConnectionId(null);
    }
  };

  const handleSubmit = async (values: ConnectionFormValues) => {
    try {
      // Convert port to number to avoid GraphQL type errors
      const portNumber = Number(values.port);
      if (isNaN(portNumber)) {
        message.error("Port must be a valid number");
        return;
      }

      if (editingConnection) {
        // Update existing connection
        const updateInput: UpdateConnectionDto = {
          name: values.name,
          description: values.description,
          type: values.type,
          host: values.host,
          port: portNumber,
          database: values.database,
          username: values.username,
          isActive: values.isActive,
        };

        // Only include password if it's provided
        if (values.password) {
          updateInput.password = values.password;
        }

        await updateConnection({
          variables: {
            id: editingConnection._id,
            updateConnectionInput: updateInput,
          },
        });
        message.success("Connection updated successfully");
      } else {
        // Create new connection
        const createInput: CreateConnectionDto = {
          name: values.name,
          description: values.description,
          type: values.type,
          host: values.host,
          port: portNumber,
          database: values.database,
          username: values.username,
          password: values.password,
        };

        await createConnection({
          variables: { createConnectionInput: createInput },
        });
        message.success("Connection created successfully");
      }

      setIsModalVisible(false);
      refetchConnections();
    } catch (error: any) {
      console.error("Submit error:", error);

      // Extract meaningful error message
      let errorMessage = editingConnection
        ? "Failed to update connection"
        : "Failed to create connection";

      if (error?.graphQLErrors?.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error?.networkError?.message) {
        errorMessage = error.networkError.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setLastError(errorMessage);
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Connection) => (
        <Space>
          <DatabaseOutlined
            style={{ color: record.isActive ? "#52c41a" : "#d9d9d9" }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: DatabaseType) => (
        <Tag color="blue">{type.replace("_", " ")}</Tag>
      ),
    },
    {
      title: "Host",
      dataIndex: "host",
      key: "host",
    },
    {
      title: "Database",
      dataIndex: "database",
      key: "database",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Connection) => (
        <Space>
          <Tooltip title="Test Connection">
            <Button
              type="text"
              icon={<ExperimentOutlined />}
              loading={testingConnectionId === record._id}
              onClick={() => handleTestConnection(record._id)}
            />
          </Tooltip>
          <Tooltip title="Edit Connection">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditConnection(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Connection"
            description="Are you sure you want to delete this connection?"
            onConfirm={() => handleDeleteConnection(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Connection">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                loading={deletingConnectionId === record._id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Database Connections
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddConnection}
          >
            Add Connection
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={connections}
          rowKey="_id"
          loading={connectionsLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingConnection ? "Edit Connection" : "Add Connection"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setLastError(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: "16px" }}
        >
          {lastError && (
            <Alert
              message="Connection Error"
              description={lastError}
              type="error"
              showIcon
              closable
              onClose={() => setLastError(null)}
              style={{ marginBottom: "16px" }}
            />
          )}

          <Form.Item
            name="name"
            label="Connection Name"
            rules={[
              { required: true, message: "Please enter connection name" },
            ]}
          >
            <Input placeholder="My Database Connection" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={2}
              placeholder="Optional description for this connection"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Database Type"
            rules={[{ required: true, message: "Please select database type" }]}
          >
            <Select placeholder="Select database type">
              {Object.values(DatabaseType).map((type) => (
                <Select.Option key={type} value={type}>
                  {type.replace("_", " ")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="host"
              label="Host"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Please enter host" }]}
            >
              <Input placeholder="localhost" />
            </Form.Item>

            <Form.Item
              name="port"
              label="Port"
              style={{ width: "120px" }}
              rules={[{ required: true, message: "Please enter port" }]}
            >
              <Input type="number" placeholder="5432" />
            </Form.Item>
          </div>

          <Form.Item
            name="database"
            label="Database Name"
            rules={[{ required: true, message: "Please enter database name" }]}
          >
            <Input placeholder="my_database" />
          </Form.Item>

          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              name="username"
              label="Username"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input placeholder="username" />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                editingConnection
                  ? "Password (leave empty to keep current)"
                  : "Password"
              }
              style={{ flex: 1 }}
              rules={
                editingConnection
                  ? []
                  : [{ required: true, message: "Please enter password" }]
              }
            >
              <Input.Password placeholder="password" />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={creating || updating}
              >
                {editingConnection ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ConnectionsPage;
