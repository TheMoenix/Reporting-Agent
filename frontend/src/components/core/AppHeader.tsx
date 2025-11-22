import {
  MenuOutlined,
  PlusOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { Row, Col, Flex, theme, Typography, Drawer, Button, Grid } from "antd";
import { Header } from "antd/es/layout/layout";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MainMenu } from "./MainMenu";
import DashboardIcon from "./../../assets/images/dashboardIcon.svg";
import { generateUUID } from "../../common/util";
import { useGetUserThreadsQuery } from "../../graphql/generated/hooks";

const { useBreakpoint } = Grid;

export function AppHeader() {
  const screens = useBreakpoint();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { data: threads, refetch, loading } = useGetUserThreadsQuery();

  const handleNewRequest = () => {
    const newThreadId = generateUUID();
    navigate(`/thread/${newThreadId}`);
  };

  const handleHistoryClick = () => {
    setShowMenu(true);
  };

  const handleConnectionClick = () => {
    navigate("/connections");
  };

  const handleSqlExamplesClick = () => {
    navigate("/sql-examples");
  };

  return (
    <Header
      style={{
        background: colorBgContainer,
        padding: "0",
      }}
    >
      <Row style={{ height: "100%" }}>
        <Col span={24} style={{ padding: "0 16px" }}>
          <Flex
            align="center"
            justify="space-between"
            style={{ height: "100%" }}
          >
            <Typography.Title ellipsis level={3} style={{ margin: "0" }}>
              {t("title")}
            </Typography.Title>
            <Flex
              align="center"
              justify="flex-end"
              gap="middle"
              style={{ height: "100%" }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewRequest}
              >
                {t("new_request")}
              </Button>
              <Button
                type="default"
                icon={<DatabaseOutlined />}
                onClick={handleConnectionClick}
              >
                {t("connections")}
              </Button>
              <Button
                type="default"
                icon={<CodeOutlined />}
                onClick={handleSqlExamplesClick}
              >
                SQL Examples
              </Button>
              <Button
                type="default"
                icon={<HistoryOutlined />}
                onClick={handleHistoryClick}
              >
                {t("history")}
              </Button>
            </Flex>
          </Flex>
        </Col>
      </Row>
      <Drawer
        title={t("history")}
        placement="right"
        closable={true}
        onClose={() => setShowMenu(false)}
        open={showMenu}
        width={screens.xs ? "100%" : 400}
      >
        <MainMenu threads={threads?.getUserThreads || []} />
      </Drawer>
    </Header>
  );
}
