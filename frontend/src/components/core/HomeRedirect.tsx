import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateUUID } from "../../common/util";

function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const newThreadId = generateUUID();
    navigate(`/thread/${newThreadId}`, { replace: true });
  }, [navigate]);

  // Return null since this component just redirects
  return null;
}

export default HomeRedirect;
