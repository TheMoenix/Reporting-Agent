import { ReactElement, ReactNode } from "react";

export interface IRoute {
  path: string;
  index?: boolean;
  ignoreLayout?: boolean;
  showInMenu?: boolean;
  icon?: ReactElement;
  label?: string;
  component?: ReactElement;
}
