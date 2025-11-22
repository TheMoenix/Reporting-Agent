import { Route, Routes } from "react-router-dom";
import { IRoute } from "./common/types";

import { AppLayout } from "./components/core/AppLayout";
import ThreadPage from "./pages/ThreadPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import SqlExamplesPage from "./pages/SqlExamplesPage";
import HomeRedirect from "./components/core/HomeRedirect";

export const AppRoutes: IRoute[] = [
  {
    path: "/thread/:threadId",
    component: <ThreadPage />,
  },
  {
    path: "/connections",
    component: <ConnectionsPage />,
  },
  {
    path: "/sql-examples",
    component: <SqlExamplesPage />,
  },
];

export function AppRoute() {
  return (
    <Routes>
      {AppRoutes.map((route) => {
        if (route.ignoreLayout)
          return (
            <Route
              key={route.path}
              path={route.path}
              element={route.component}
            />
          );
        else
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<AppLayout children={route.component} />}
            />
          );
      })}
      {/* Default route - redirect to a new thread */}
      <Route path="/" element={<HomeRedirect />} />
    </Routes>
  );
}
