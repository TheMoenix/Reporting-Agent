import { Col, Flex, Row, Typography } from "antd";

type AppPageProps = {
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

function AppPage({ title, actions, children }: AppPageProps) {
  return (
    <Row>
      <Col span={12}>
        <Typography.Title level={2}>{title}</Typography.Title>
      </Col>
      <Col span={12}>
        <Flex style={{ height: "100%" }} align="center" justify="flex-end">
          {actions}
        </Flex>
      </Col>
      <Col span={24}>{children}</Col>
    </Row>
  );
}

export default AppPage;
