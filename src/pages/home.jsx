import React from "react";
import { Page, Searchbar, List, ListItem, BlockTitle } from "framework7-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SnappingSheet from "../components/SnappingSheet";
import OwnLocationMarker from "../components/OwnLocationMarker";

const SEARCH_BAR_HEIGHT = 70;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocation: {
        lat: 47.665575312188025,
        lng: 9.447241869601651,
      },
      snapSheetToState: 1,
      searchText: "",
    };
  }

  componentDidMount() {
    // fire a resize event to fix leaflets map sizing bug
    window.dispatchEvent(new Event("resize"));

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

  /*
   * Search for a place by text or coordinates
   */
  search = async () => {
    const coords = this.getCoordsFromSearchText(this.state.searchText);

    let place = {};
    if (coords !== undefined) place = await getPlaceByText(this.state.searchText);
    else place = await getPlaceByCoords(coords);
  };

  /*
   * Get coordinates from a string
   */
  getCoordsFromSearchText = text => {
    const coordinateRegex = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/;
    coordinateRegex.test(text);
    const match = text.match(coordinateRegex);
    if (!match) return undefined;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    return { lat: lat, lng: lng };
  };

  getPlaceByText = async searchText => {};

  getPlaceByCoords = async coords => {};

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
          <OwnLocationMarker position={this.state.currentLocation}></OwnLocationMarker>
        </MapContainer>

        <SnappingSheet
          snapHeightStates={[
            SEARCH_BAR_HEIGHT,
            window.innerHeight / 3 + SEARCH_BAR_HEIGHT,
            (window.innerHeight / 3) * 2 + SEARCH_BAR_HEIGHT,
          ]}
          currentState={this.state.snapSheetToState}
          snappedToState={() => this.setState({ snapSheetToState: undefined })}
        >
          <Searchbar
            style={{ height: SEARCH_BAR_HEIGHT }}
            value={this.state.searchText}
            onFocus={() => {
              this.setState({ snapSheetToState: 2 });
            }}
            placeholder="Place, address, or coordinates (lat, lng)"
            onChange={e => this.setState({ searchText: e.target.value })}
            onSubmit={() => this.search()}
          />
          <BlockTitle medium>Your order:</BlockTitle>

          <List>
            <ListItem title="Item 1" />
            <ListItem title="Item 2" />
            <ListItem title="Item 3" />
          </List>
        </SnappingSheet>
      </Page>
    );
  }
}

export default Home;
