import { ApolloProvider } from "@apollo/client";
import { AppRoute } from "./Routes";
import { App as AntApp } from "antd";
import { createApolloClient } from "./graphql";

import { I18nextProvider, useTranslation } from "react-i18next";

export function App() {
  const { i18n } = useTranslation();
  return (
    <ApolloProvider client={createApolloClient()}>
      <I18nextProvider i18n={i18n}>
        <AntApp>
          <AppRoute />
        </AntApp>
      </I18nextProvider>
    </ApolloProvider>
  );
}
