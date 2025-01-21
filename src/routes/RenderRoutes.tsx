import { ReactNode } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";

import AuthWarning from "../components/AuthWarning/AuthWarning";
import useAuthWarning from "../hooks/useAuthWarning";
import Chat from "../pages/chat/Chat";
import Layout from "../pages/layout/Layout";
import NoPage from "../pages/NoPage";
import ServiceDesk from "../pages/service_desk/ServiceDesk";
import Tender from "../pages/tender/Tender";

const RenderRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
          <Route index element={<ServiceDesk />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tender" element={<Tender />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default RenderRoutes;

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { showAuthMessage } = useAuthWarning();
  return showAuthMessage ? <AuthWarning /> : <>{children}</>;
};
