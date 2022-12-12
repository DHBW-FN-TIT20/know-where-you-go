import React from "react";

import process from "node:process";

import { App, Block, Navbar, Page, Panel, View, Views } from "framework7-react";

import routes from "../js/routes";
import store from "../js/store";

class MyApp extends React.Component {
  f7params = {
    name: "Know Where You Go", // App name
    theme: "auto", // Automatic theme detection
    // App store
    store: store,
    // App routes
    routes: routes,
    // Register service worker (only on production build)
    serviceWorker:
      process.env.NODE_ENV === "production"
        ? {
            path: "/service-worker.js",
          }
        : {},
  };

  render() {
    return (
      <App {...this.f7params} dark>
        {/* Left panel with cover effect*/}
        <Panel left cover dark>
          <View>
            <Page>
              <Navbar title="Left Panel" />
              <Block>Left panel content goes here</Block>
            </Page>
          </View>
        </Panel>

        {/* Views/Tabs container */}
        <Views tabs className="safe-areas">
          <View id="view-home" main tab tabActive url="/" />
        </Views>
      </App>
    );
  }
}

export default MyApp;
