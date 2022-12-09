import React from 'react';
import {
  Page,
  Navbar,
  NavLeft,
  Link,
} from 'framework7-react';

class Home extends React.Component {

  render() {
    return (

      <Page name="home">

        {/* Top Navbar */}

        <Navbar sliding={false}>
          <NavLeft>
            <Link iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu" panelOpen="left" />
          </NavLeft>
        </Navbar>

        {/* Page content */}

      </Page>
    )
  }
}

export default Home;