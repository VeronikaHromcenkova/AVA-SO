import { useContext, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Stack } from "@fluentui/react";

// import { Dismiss16Regular as Close, LineHorizontal320Regular as MenuIcon } from "@fluentui/react-icons";
import Arvato from "../../assets/Arvato-logo-white.svg";
import { AppStateContext } from "../../state/AppProvider";

import styles from "./Layout.module.css";

const Layout = () => {
  const [logo, setLogo] = useState("");
  const appStateContext = useContext(AppStateContext);
  // const isSidebarMenuOpen = appStateContext?.state.isSidebarMenuOpen;
  const ui = appStateContext?.state.frontendSettings?.ui;
  // const Menu = isSidebarMenuOpen ? Close : MenuIcon;

  // const handleSidebarMenuClick = () => {
  //   appStateContext?.dispatch({ type: "TOGGLE_SIDEBAR_MENU" });
  // };

  useEffect(() => {
    if (!appStateContext?.state.isLoading) {
      setLogo(ui?.logo || Arvato);
    }
  }, [appStateContext?.state.isLoading]);

  useEffect(() => {}, [appStateContext?.state.isCosmosDBAvailable.status]);

  return (
    <div className={styles.layout}>
      <header className={styles.header} role={"banner"}>
        <Stack horizontal verticalFill verticalAlign="center" horizontalAlign="space-between">
          <Stack horizontal verticalAlign="center">
            <img src={logo} className={styles.headerIcon} aria-hidden="true" alt="" />
            <Link to="/" className={styles.headerTitleContainer}>
              <h1 className={styles.headerTitle}>{ui?.title}</h1>
            </Link>
          </Stack>
          {/* <Stack horizontal>
            <Menu role="button" className={styles.menuIcon} onClick={handleSidebarMenuClick} />
          </Stack> */}
        </Stack>
      </header>
      <Outlet />
    </div>
  );
};

export default Layout;
