import React from "react";
import { Page, Searchbar, List, BlockTitle, Button, ListItem, Toggle } from "framework7-react";
import { MapContainer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SnappingSheet from "../components/SnappingSheet";
import LocationMarker from "../components/LocationMarker";
import AccuracyCircle from "../components/AccuracyCircle";
import OutlinePolygon from "../components/OutlinePolygon";
import { getPlaceByNominatimData, getCoordsFromSearchText } from "../js/helpers";
import WikiInfo from "../components/WikiInfo";
import MemoFetcher from "../js/memo-fetcher";
import L from "leaflet";
import "leaflet-routing-machine";

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
      selectedCoords: { lat: undefined, lng: undefined },
      searchSuggestions: [],
      showSearchSuggestions: false,
      showRouting: true,
      routingDistance: 0,
      routingTime: 0,
      showRoutingDistanceAndDuration: false,
      tileLayerStyle: "map",
    };
    this.sheetHeightStates = [
      SEARCH_BAR_HEIGHT,
      window.innerHeight * 0.25 + SEARCH_BAR_HEIGHT,
      window.innerHeight * 0.8 + SEARCH_BAR_HEIGHT,
    ];
    this.suggestionTimeout = undefined;
    this.mapNeedsUpdate = false;
    this.mapSlowAnimation = true;
    this.routingNeedsUpdate = false;
    this.tileLayerNeedsUpdate = true;
    this.mapZoom = 4;
    this.mapCenter = {
      lat: 47.665575312188025,
      lng: 9.447241869601651,
    };
    this.memoFetcher = new MemoFetcher();
    this.routingMachine = undefined;
    this.tileLayer = undefined;
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
    this.routingNeedsUpdate = true;
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
      showRouting: true,
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
    this.routingNeedsUpdate = true;
    const place = await this.getPlaceByCoords(coords, zoom);
    this.setState({
      place: place,
      snapSheetToState: 1,
      selectedCoords: coords,
      showRouting: true,
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
   * Toggles the tile layer from satellite to map and vice versa
   * @returns {void}
   */
  toggleTileLayer = () => {
    this.tileLayerNeedsUpdate = true;
    this.setState({ tileLayerStyle: this.state.tileLayerStyle === "satellite" ? "map" : "satellite" });
  };

  /**
   * Small Component to interact with the leaflet map
   * @returns {null}
   */
  MapHook = () => {
    const map = useMap();

    // set the center of the map to this.state.mapCenter (but let the user move it)
    if (this.mapNeedsUpdate) {
      console.log("update map");
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

    // tile layer
    if (this.tileLayerNeedsUpdate) {
      if (this.tileLayer) map.removeLayer(this.tileLayer);
      this.tileLayer = L.tileLayer(
        this.state.tileLayerStyle === "satellite"
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
        {
          attribution: this.state.tileLayerStyle === "satellite" ? "Tiles &copy; Esri" : "Tiles &copy; OpenStreetMap",
        },
      ).addTo(map);
      this.tileLayerNeedsUpdate = false;
    }

    // routing
    if (!this.routingNeedsUpdate) return null;

    if (this.routingMachine) map.removeControl(this.routingMachine);
    if (
      this.state.currentLocation.lat === undefined ||
      this.state.currentLocation.lng === undefined ||
      this.state.selectedCoords?.lat === undefined ||
      this.state.selectedCoords?.lng === undefined ||
      this.state.currentLocation.lat === this.state.selectedCoords.lat ||
      this.state.currentLocation.lng === this.state.selectedCoords.lng ||
      this.state.showRouting === false
    )
      return null;

    this.routingMachine = L.Routing.control({
      waypoints: [
        L.latLng(this.state.currentLocation.lat, this.state.currentLocation.lng),
        L.latLng(this.state.selectedCoords.lat, this.state.selectedCoords.lng),
      ],
      routeWhileDragging: false,
      // @ts-ignore
      createMarker: () => null,
      fitSelectedRoutes: false,
      draggableWaypoints: false,
      lineOptions: {
        styles: [{ color: "blue", opacity: 1, weight: 2 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      addWaypoints: false,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      collapsible: true,
    });

    // if a route is found, check if it is too near to the current location and if so, don't show it
    this.routingMachine.on("routesfound", event => {
      if (event.routes[0] === undefined) return;
      const minDistance = 400;
      if (event.routes[0].summary.totalDistance < minDistance) this.routingNeedsUpdate = true;
      this.setState({
        routingDistance: event.routes[0].summary.totalDistance,
        routingTime: event.routes[0].summary.totalTime,
        showRouting: event.routes[0].summary.totalDistance > minDistance,
        showRoutingDistanceAndDuration: event.routes[0].summary.totalDistance > minDistance,
      });
    });
    this.routingMachine.addTo(map);
    this.routingNeedsUpdate = false;
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
        <Toggle
          style={{ position: "absolute", top: "5px", right: "5px", zIndex: 1000 }}
          onChange={this.toggleTileLayer}
        />
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
          <BlockTitle style={{ display: this.state.showRoutingDistanceAndDuration ? "block" : "none" }}>
            {Math.round(this.state.routingDistance / 1000)} km,{" "}
            {
              // eslint-disable-next-line max-len
              this.state.routingTime > 3600
                ? Math.round(this.state.routingTime / 3600) +
                  " h " +
                  Math.round((this.state.routingTime % 3600) / 60) +
                  " min"
                : Math.round(this.state.routingTime / 60) + " min"
            }
          </BlockTitle>
          <BlockTitle>{address}</BlockTitle>
          <WikiInfo place={this.state.place} />
          <Button
            round
            outline
            href="/impressum"
            text="Impressum"
            style={{ width: "fit-content", marginLeft: "50%" }}
          ></Button>
        </SnappingSheet>
      </Page>
    );
  }
}

export default Home;
