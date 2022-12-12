import React from "react";
import { Page, Sheet, Searchbar, List, ListItem, BlockTitle } from "framework7-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SEARCH_BAR_HEIGHT = 70;

class Home extends React.Component {
  touchOnSheetStartY = 0;
  sheetScrollAreaRef = React.createRef();
  sheetHeightStates = {
    completelyClosed: 0,
    oneThirdOpen: 0,
    completelyOpen: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      sheetOpened: true,
      sheetHeight: SEARCH_BAR_HEIGHT,
      sheetHeightTransitionStyle: "0.3s ease-in-out",
      currentLocation: {
        lat: 47,
        lng: 9,
      },
    };
  }

  componentDidMount() {
    // fire a resize event to fix leaflets map sizing bug
    window.dispatchEvent(new Event("resize"));

    // add touch listeners to the sheet
    this.sheetScrollAreaRef.current.addEventListener("touchstart", this.touchStartOnSheet, { passive: false });
    this.sheetScrollAreaRef.current.addEventListener("touchmove", this.touchMoveOnSheet, { passive: false });
    this.sheetScrollAreaRef.current.addEventListener("touchend", this.touchEndOnSheet, { passive: false });

    // calculate the different sheet height states based on the window height
    this.sheetHeightStates = {
      completelyClosed: SEARCH_BAR_HEIGHT,
      oneThirdOpen: window.innerHeight / 3 + SEARCH_BAR_HEIGHT,
      completelyOpen: (window.innerHeight / 3) * 2 + SEARCH_BAR_HEIGHT,
    };

    // get the current location
    navigator.geolocation.getCurrentPosition(position => {
      console.log(position);
      this.setState({
        currentLocation: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      });
    });
  }

  MapHook = () => {
    const map = useMap();
    map.flyTo([this.state.currentLocation.lat, this.state.currentLocation.lng], 13);
    return null;
  };

  render() {
    return (
      <Page name="home">
        <MapContainer
          center={[this.state.currentLocation.lat, this.state.currentLocation.lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%" }}
          touchZoom={true}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <this.MapHook />
        </MapContainer>

        <div id="sheetSwipeArea" ref={this.sheetScrollAreaRef}>
          <Sheet
            style={{
              height: this.state.sheetHeight,
              transition: this.state.sheetHeightTransitionStyle,
            }}
            opened={true}
          >
            <Searchbar style={{ height: SEARCH_BAR_HEIGHT }} />
            <BlockTitle medium>Your order:</BlockTitle>

            <List>
              <ListItem title="Item 1" />
              <ListItem title="Item 2" />
              <ListItem title="Item 3" />
            </List>

            <div></div>
          </Sheet>
        </div>
      </Page>
    );
  }

  touchStartOnSheet = event => {
    this.touchOnSheetStartY = event.touches[0].clientY;
    this.setState({ sheetHeightTransitionStyle: "0s" });
  };

  touchMoveOnSheet = event => {
    event.preventDefault();

    // calculate the new sheet height
    const touchOnSheetEndY = event.touches[0].clientY;
    const touchDifference = this.touchOnSheetStartY - touchOnSheetEndY;
    const newSheetHeight = this.state.sheetHeight + touchDifference;

    // check if the new sheet height is in the allowed range
    if (newSheetHeight < this.sheetHeightStates.completelyClosed) {
      this.setState({ sheetHeight: this.sheetHeightStates.completelyClosed });
      return;
    }
    if (newSheetHeight > this.sheetHeightStates.completelyOpen) {
      this.setState({ sheetHeight: this.sheetHeightStates.completelyOpen });
      return;
    }

    // set the new sheet height and update the touch start position
    this.setState({ sheetHeight: newSheetHeight });
    this.touchOnSheetStartY = touchOnSheetEndY;
  };

  touchEndOnSheet = () => {
    // snap the sheet to the nearest height state
    const sheetHeightStates = Object.values(this.sheetHeightStates);
    const closestSheetHeightState = sheetHeightStates.reduce((prev, curr) => {
      return Math.abs(curr - this.state.sheetHeight) < Math.abs(prev - this.state.sheetHeight) ? curr : prev;
    });

    // transition to the new sheet height
    this.setState({ sheetHeightTransitionStyle: "0.3s ease-in-out", sheetHeight: closestSheetHeightState });
  };
}

export default Home;
