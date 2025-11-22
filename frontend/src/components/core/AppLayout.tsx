import { Layout, theme } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import { AppHeader } from "./AppHeader";

export function AppLayout(props: { children: React.ReactNode }) {
  return (
    <Layout
      style={{
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <AppHeader />
      <Layout>
        <Content
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              // padding: 24,
              overflow: "auto",
              flex: 1,
              // background: colorBgContainer,
              // borderRadius: borderRadiusLG,
            }}
          >
            {props.children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
