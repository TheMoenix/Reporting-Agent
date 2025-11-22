import { Flex, Menu } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type MainMenuProps = {
  threads: any[];
};

export function MainMenu({ threads }: MainMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Extract threadId from current path
  const getCurrentThreadId = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] === "thread" && pathParts[2]) {
      return pathParts[2];
    }
    return "";
  };

  // States
  const [selectedKey, setSelectedKey] = useState<string>(getCurrentThreadId());

  const parseMenuItems = (threads: any[]) => {
    return threads.map((thread) => ({
      label: thread.topic ? t(thread.topic) : "",
      key: thread.threadId,
      onClick: () => navigate(`/thread/${thread.threadId}`),
    }));
  };

  // Effects
  useEffect(() => {
    setSelectedKey(getCurrentThreadId());
  }, [location.pathname]);

  return (
    <Flex vertical gap="small">
      <Menu
        selectedKeys={[selectedKey]}
        mode="inline"
        items={parseMenuItems(threads)}
      />
    </Flex>
  );
}
