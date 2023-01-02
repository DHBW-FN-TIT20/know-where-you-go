import React from "react";
import { Page, Searchbar, List, BlockTitle, Button, ListItem } from "framework7-react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SnappingSheet from "../components/SnappingSheet";
import LocationMarker from "../components/LocationMarker";
import AccuracyCircle from "../components/AccuracyCircle";
import OutlinePolygon from "../components/OutlinePolygon";
import { getPlaceByNominatimData, getCoordsFromSearchText } from "../js/helpers";
import WikiInfo from "../components/WikiInfo";
import MemoFetcher from "../js/memo-fetcher";

const SEARCH_BAR_HEIGHT = 70;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentLocation: {
        lat: 47.665575312188025,
        lng: 9.447241869601651,
        accuracy: 0,
      },
      snapSheetToState: 1,
      searchText: "",
      place: {},
      mapHeight: window.innerHeight - SEARCH_BAR_HEIGHT,
      selectedCoords: undefined,
      searchSuggestions: [],
      showSearchSuggestions: false,
    };

    this.sheetHeightStates = [
      SEARCH_BAR_HEIGHT,
      window.innerHeight * 0.25 + SEARCH_BAR_HEIGHT,
      window.innerHeight * 0.8 + SEARCH_BAR_HEIGHT,
    ];
    this.suggestionTimeout = undefined;
    this.mapNeedsUpdate = false;
    this.mapSlowAnimation = true;
    this.mapZoom = 4;
    this.mapCenter = {
      lat: 47.665575312188025,
      lng: 9.447241869601651,
    };
    this.memoFetcher = new MemoFetcher();
  }

  componentDidMount() {
    // fire a resize event to fix leaflets map sizing bug
    window.dispatchEvent(new Event("resize"));

    // get the current location
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        currentLocation: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      });
      this.updatePlaceByCoords({ lat: position.coords.latitude, lng: position.coords.longitude }, 18, true);
    });

    // update the current location every 5 seconds
    this.currentLocationInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      });
    }, 5000);
  }

  /**
   * Search for a place by text or coordinates
   * @param {string} searchText
   */
  updatePlaceBySearch = async searchText => {
    const coords = getCoordsFromSearchText(searchText);

    let place = {};
    if (coords !== undefined) place = await this.getPlaceByCoords(coords);
    else place = await this.getPlaceByText(searchText);

    if (place === undefined) return;
    this.mapNeedsUpdate = true;
    this.mapZoom = place.zoomLevel;
    this.mapCenter = {
      lat: place.realCoords.lat,
      lng: place.realCoords.lng,
    };
    this.setState({
      place: place,
      snapSheetToState: 1,
      selectedCoords: place.realCoords,
      showSearchSuggestions: false,
    });
  };

  /**
   * Update the place by given coordinates
   * @param {{lat: number, lng: number}} coords
   * @param {number} zoom
   */
  updatePlaceByCoords = async (coords, zoom, updateMap = false) => {
    if (updateMap) {
      this.mapNeedsUpdate = true;
      this.mapZoom = zoom;
      this.mapCenter = {
        lat: coords.lat,
        lng: coords.lng,
      };
    }
    const place = await this.getPlaceByCoords(coords, zoom);
    this.setState({
      place: place,
      snapSheetToState: 1,
      selectedCoords: coords,
    });
  };

  /**
   * Get a place from nominatim by text
   * @param {string} searchText
   * @returns Promise<Place>
   */
  getPlaceByText = async searchText => {
    const data = await this.memoFetcher.fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchText}&format=json&addressdetails=1&limit=1&extratags=1`,
    );
    if (data[0] === undefined) return;
    const place = getPlaceByNominatimData(data[0], undefined);
    place.userInputCoords = place.realCoords;
    return place;
  };

  /**
   * Get a place from nominatim by coordinates
   * @param {{lat: number, lng: number}} coords
   * @param {number} zoom
   * @returns {Promise<any>}
   */
  getPlaceByCoords = async (coords, zoom = 20) => {
    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&extratags=1&zoom=${
        parseInt(`${zoom}`) + 1
      }&addressdetails=1`,
    );
    if (data === undefined) return;
    const place = getPlaceByNominatimData(data, coords);
    if (place?.realCoords?.lat === undefined || place?.realCoords?.lng === undefined) {
      place.realCoords = coords;
    }
    return place;
  };

  /**
   * Get the search suggestions from nominatim
   * @param {string} searchText
   * @returns {Promise<void>}
   */
  updateSearchSuggestions = async searchText => {
    if (searchText.trim().length < 3) {
      this.setState({ searchSuggestions: [] });
      return;
    }
    clearTimeout(this.suggestionTimeout);
    this.suggestionTimeout = setTimeout(async () => {
      const data = await this.memoFetcher.fetch(
        `https://nominatim.openstreetmap.org/search?q=${searchText}&format=json&limit=5`,
      );
      const searchSuggestions = data.map(place => {
        const placeData = {
          displayName: place?.display_name || "Unknown location",
        };
        return placeData;
      });
      this.setState({ searchSuggestions });
    }, 200);
  };

  /**
   * Small Component to interact with the leaflet map
   * @returns {null}
   */
  MapHook = () => {
    const map = useMap();

    // set the center of the map to this.state.mapCenter (but let the user move it)
    if (this.mapNeedsUpdate) {
      map.flyTo(this.mapCenter, this.mapZoom, { animate: true, duration: this.mapSlowAnimation ? 4 : 1 });
      this.mapNeedsUpdate = false;
      this.mapSlowAnimation = false;
    }

    useMapEvents({
      click: event => {
        this.updatePlaceByCoords(event.latlng, this.mapZoom);
      },
      zoom: () => {
        this.mapZoom = map.getZoom();
      },
      contextmenu: event => {
        this.updatePlaceByCoords(event.latlng, 18, true);
      },
    });

    return null;
  };

  render() {
    // address object -> string
    let address = "";
    if (this.state.place.address !== undefined) {
      Object.values(this.state.place.address).forEach(value => {
        if (value !== undefined && value !== "") address += value + ", ";
      });
    }

    return (
      <Page name="home">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: "100%", cursor: "crosshair" }}
          touchZoom={true}
          zoomControl={false}
        >
          <AccuracyCircle
            center={{ lat: this.state.currentLocation.lat, lng: this.state.currentLocation.lng }}
            radius={this.state.currentLocation.accuracy}
            visible={this.state.currentLocation.accuracy !== 0}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            iconUrl={"img/OwnLocationMarker.png"}
            position={this.state.currentLocation}
            visible={this.state.currentLocation.accuracy !== 0}
            size={{ width: 20, height: 20 }}
          />
          <LocationMarker
            iconUrl={"img/LocationMarker.png"}
            position={this.state.selectedCoords}
            visible={this.state.selectedCoords !== undefined}
            size={{ width: 40, height: 40 }}
            anchor={{ x: 20, y: 40 }}
          />
          <this.MapHook />
          <OutlinePolygon placeName={this.state.place.name} />
        </MapContainer>

        <SnappingSheet
          snapHeightStates={this.sheetHeightStates}
          currentState={this.state.snapSheetToState}
          snappedToHeight={() => this.setState({ snapSheetToState: undefined })}
        >
          <Searchbar
            style={{ height: SEARCH_BAR_HEIGHT, margin: 0 }}
            value={this.state.searchText}
            onFocus={() => {
              this.setState({ snapSheetToState: 2, showSearchSuggestions: true });
            }}
            placeholder="Place, address, or coordinates (lat, lng)"
            onChange={event => {
              this.setState({ searchText: event.target.value });
              this.updateSearchSuggestions(event.target.value);
            }}
            onSubmit={event => {
              event.target.blur(); // hide keyboard TODO: this is not working yet
              this.updatePlaceBySearch(this.state.searchText);
            }}
            onClickClear={() => {
              this.setState({ searchText: "", showSearchSuggestions: false, searchSuggestions: [] });
            }}
            onSearchbarDisable={() => {
              this.setState({ snapSheetToState: 0, showSearchSuggestions: false });
            }}
            onSearchbarClear={() => {
              this.setState({ searchText: "", showSearchSuggestions: false });
            }}
            onClickDisable={() => {
              this.setState({ snapSheetToState: 0, showSearchSuggestions: false });
            }}
          />

          <div
            className="sheet-modal-inner"
            style={{
              overflow: "hidden scroll",
              height: `calc(100% - ${SEARCH_BAR_HEIGHT}px)`,
            }}
          >
            <List>
              {this.state.showSearchSuggestions &&
                this.state.searchSuggestions.map((suggestion, index) => {
                  return (
                    <ListItem
                      key={index}
                      title={suggestion["displayName"]}
                      onClick={() => {
                        this.setState({ searchText: suggestion["displayName"], showSearchSuggestions: false });
                        this.updatePlaceBySearch(suggestion["displayName"]);
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  );
                })}
            </List>
            <BlockTitle medium>{this.state.place.name}</BlockTitle>
            <BlockTitle>{address}</BlockTitle>
            <WikiInfo place={this.state.place} />
            <Button
              round
              outline
              href="/impressum"
              text="Impressum"
              style={{ width: "fit-content", margin: "0 auto 2rem auto" }}
            ></Button>
          </div>
        </SnappingSheet>
      </Page>
    );
  }
}

export default Home;
