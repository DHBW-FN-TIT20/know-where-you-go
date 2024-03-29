/* eslint-disable max-len */
import React from "react";
import { Page, Searchbar, List, BlockTitle, Button, ListItem, BlockHeader, Block, Link } from "framework7-react";
import { MapContainer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SnappingSheet from "../components/SnappingSheet";
import LocationMarker from "../components/LocationMarker";
import AccuracyCircle from "../components/AccuracyCircle";
import OutlinePolygon from "../components/OutlinePolygon";
import {
  getPlaceByNominatimData,
  getCoordsFromSearchText,
  saveObjectToLocalStorage,
  getObjectFromLocalStorage,
  formatAddressObject,
  findHumanPlaceName,
} from "../js/helpers";
import WikiInfo from "../components/WikiInfo";
import MemoFetcher from "../js/memo-fetcher";
import L from "leaflet";
import "leaflet-routing-machine";
import MapCredits from "../components/MapCredits";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.searchBarHeight = 70;
    this.notchOffset = 40;
    this.state = {
      currentLocation: {
        lat: 47.665575312188025,
        lng: 9.447241869601651,
        accuracy: 0,
      },
      snapSheetToState: 1,
      searchText: "",
      place: {},
      mapHeight: window.innerHeight - this.searchBarHeight,
      selectedCoords: { lat: undefined, lng: undefined },
      searchSuggestions: [],
      lastVisitedPlaces: getObjectFromLocalStorage("lastVisitedPlaces") || [],
      showSearchSuggestions: false,
      showRouting: true,
      routingDistance: 0,
      routingTime: 0,
      showRoutingDistanceAndDuration: false,
      tileLayerStyle: "map",
      sheetHeightStates: [this.searchBarHeight, window.innerHeight * 0.4, window.innerHeight - (64 + this.notchOffset)],
    };
    this.currentLocationActive = true;
    this.dontUpdateButton = true;
    this.suggestionTimeout = undefined;
    this.mapNeedsUpdate = false;
    this.initialAnimation = true;
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
    this.focusOnSearchBar = false; // needed to prevent autoscrolling on focus of searchbar
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
      this.updatePlaceByCoords({ lat: position.coords.latitude, lng: position.coords.longitude }, 18, true, false);
    });

    // update the current location every 5 seconds
    this.currentLocationInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(position => {
        if (
          this.currentLocationActive &&
          (Math.abs(position.coords.latitude - this.mapCenter.lat) > 0.0001 ||
            Math.abs(position.coords.longitude - this.mapCenter.lng) > 0.0001)
        ) {
          this.mapNeedsUpdate = true;
          this.mapCenter = { lat: position.coords.latitude, lng: position.coords.longitude };
        }
        this.setState({
          currentLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      });
    }, 5000);

    // eventlistener on resize to update the sheetHeightStates
    window.addEventListener("resize", this.handleScreenChange);
    window.addEventListener("orientationchange", this.handleScreenChange);
  }

  /**
   * event listener for handling both the resize and orientationchange events
   * @returns {null}
   */
  handleScreenChange = () => {
    this.setState({
      mapHeight: window.innerHeight - this.searchBarHeight,
      sheetHeightStates: [this.searchBarHeight, window.innerHeight * 0.4, window.innerHeight - (64 + this.notchOffset)],
      snapSheetToState: 2,
    });
  };

  /**
   * Search for a place by text or coordinates
   * @param {string} searchText
   * @param {string | undefined} osmID
   * @returns Promise<Place>
   */
  updatePlaceBySearchOrOsmID = async (searchText, osmID = undefined) => {
    // if a osmID is given, use it, otherwise use the search text
    let place = {};
    if (osmID !== undefined) {
      place = await this.getPlaceByOsmID(osmID);
    } else {
      const coords = getCoordsFromSearchText(searchText);
      if (coords !== undefined) place = await this.getPlaceByCoords(coords);
      else place = await this.getPlaceByText(searchText);
    }

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
    this.addPlaceToLastVisited(place);
  };

  /**
   * Update the place by given coordinates
   * @param {{lat: number, lng: number}} coords
   * @param {number} zoom
   */
  updatePlaceByCoords = async (coords, zoom, updateMap = false, updatePin = true) => {
    if (updateMap) {
      this.mapNeedsUpdate = true;
      this.mapZoom = zoom;
      this.mapCenter = {
        lat: coords.lat,
        lng: coords.lng,
      };
    }
    this.setState({ snapSheetToState: 1 });
    // to prevent updating pin when initially opening the map, otherwise do it
    if (updatePin) {
      this.setState({ selectedCoords: coords });
    }
    const place = await this.getPlaceByCoords(coords, zoom);
    this.setState({
      place: place,
      showRouting: true,
    });
    this.routingNeedsUpdate = true;
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
   * Get a place from nominatim by osmID
   * @param {string} osmID
   * @returns {Promise<any>}
   */
  getPlaceByOsmID = async osmID => {
    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://nominatim.openstreetmap.org/lookup?format=json&osm_ids=${osmID}&extratags=1&addressdetails=1`,
    );
    if (data[0] === undefined) return;
    const place = getPlaceByNominatimData(data[0], undefined);
    return place;
  };

  /**
   * Get the search suggestions from nominatim
   * @param {string} searchText
   * @returns {Promise<void>}
   */
  updateSearchSuggestions = async searchText => {
    if (searchText.trim().length < 3) {
      this.setState({
        searchSuggestions: this.state.lastVisitedPlaces.map(place => {
          return { displayName: place.name, osmID: place.osmId };
        }),
      });
      return;
    }
    clearTimeout(this.suggestionTimeout);
    this.suggestionTimeout = setTimeout(async () => {
      const data = await this.memoFetcher.fetch(
        // eslint-disable-next-line max-len
        `https://photon.komoot.io/api/?q=${searchText}&limit=5&lang=de&lat=${this.state.currentLocation.lat}&lon=${this.state.currentLocation.lng}`,
      );
      const searchSuggestions = data.features.map(place => {
        const placeData = {
          displayName:
            place?.properties?.name ||
            // eslint-disable-next-line max-len
            `${place?.properties?.street} ${place?.properties?.housenumber} ${place?.properties?.postcode} ${place?.properties?.city}`,
          osmID: place?.properties?.osm_type + place?.properties?.osm_id,
        };
        return placeData;
      });
      if (this.state.searchText === searchText) this.setState({ searchSuggestions });
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
   * Resets the map to the current location
   * @returns {void}
   */
  goBackToCurrentLocation = () => {
    //check if we are already at our current location
    if (this.currentLocationActive) {
      return;
    }
    this.mapNeedsUpdate = true;
    this.mapCenter = this.state.currentLocation;
    this.mapZoom = 18;
    this.setState({ snapSheetToState: 0 });
    this.currentLocationButton = document.getElementById("currentLocationButton");
    this.currentLocationButton.classList.remove("bi-cursor");
    this.currentLocationButton.classList.add("bi-cursor-fill");
    this.currentLocationActive = true;
    this.dontUpdateButton = true;
  };

  /**
   * Adds a place to the last visited places (so that the this.state.lastVisitedPlaces array is not longer than 5)
   * @param {Object} place
   * @returns {void}
   */
  addPlaceToLastVisited = place => {
    const lastVisitedPlaces = this.state.lastVisitedPlaces;

    // remove the place if it is already in the array
    const index = lastVisitedPlaces.findIndex(p => p.osmId === place.osmId);
    if (index !== -1) lastVisitedPlaces.splice(index, 1);

    // add the place to the beginning of the array and remove the last element if the array is longer than 5
    lastVisitedPlaces.unshift(place);
    if (lastVisitedPlaces.length > 5) lastVisitedPlaces.pop();
    saveObjectToLocalStorage("lastVisitedPlaces", lastVisitedPlaces);
    this.setState({ lastVisitedPlaces });
  };

  /**
   * Small Component to interact with the leaflet map
   * @returns {null}
   */
  MapHook = () => {
    const map = useMap();

    // set the center of the map to this.state.mapCenter (but let the user move it)
    if (this.mapNeedsUpdate) {
      map.flyTo(this.mapCenter, this.mapZoom, { animate: true, duration: this.initialAnimation ? 4 : 1 });
      this.mapNeedsUpdate = false;
      this.initialAnimation = false;
    }

    useMapEvents({
      click: event => {
        this.updatePlaceByCoords(event.latlng, this.mapZoom);
      },
      movestart: () => {
        if (this.dontUpdateButton) {
          this.dontUpdateButton = false;
        } else {
          this.currentLocationButton = document.getElementById("currentLocationButton");
          this.currentLocationButton.classList.remove("bi-cursor-fill");
          this.currentLocationButton.classList.add("bi-cursor");
          this.currentLocationActive = false;
        }
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
      if (this.tileLayer) map?.removeLayer(this.tileLayer);
      this.tileLayer = L.tileLayer(
        this.state.tileLayerStyle === "satellite"
          ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          : "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
        {
          attribution: this.state.tileLayerStyle === "satellite" ? "Tiles &copy; Esri" : "Tiles &copy; OpenStreetMap",
          noWrap: true,
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
        styles: [{ color: "#235cb2", opacity: 0.8, weight: 4 }],
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
      const minDistance = 100;
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
    return (
      <Page name="home">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: "100%", cursor: "crosshair" }}
          touchZoom={true}
          zoomControl={false}
          id="map"
          maxBoundsViscosity={1.0}
          maxBounds={[
            [90, 180],
            [-90, -180],
          ]}
          minZoom={2}
        >
          <AccuracyCircle
            center={{ lat: this.state.currentLocation.lat, lng: this.state.currentLocation.lng }}
            radius={this.state.currentLocation.accuracy}
            visible={this.state.currentLocation.accuracy !== 0}
          />
          <LocationMarker
            iconUrl={"img/UserLocationMarker.png"}
            position={this.state.currentLocation}
            visible={this.state.currentLocation.accuracy !== 0}
            size={{ width: 24, height: 24 }}
          />
          <LocationMarker
            iconUrl={"img/TargetLocationMarker.png"}
            position={this.state.selectedCoords}
            visible={this.state.selectedCoords.lat !== undefined}
            size={{ width: 36, height: 36 }}
            anchor={{ x: 18, y: 36 }}
          />
          <this.MapHook />
          <OutlinePolygon placeName={this.state.place.name} />
        </MapContainer>

        <SnappingSheet
          snapHeightStates={this.state.sheetHeightStates}
          currentState={this.state.snapSheetToState}
          snappedToHeight={() => this.setState({ snapSheetToState: undefined })}
          outBar={
            <div className="out-bar">
              <MapCredits tileProvider={this.state.tileLayerStyle === "satellite" ? "Esri" : "OpenStreetMap"} />
              <div className="map-button-wrapper pointer-all">
                <Button fill className="map-button" onClick={this.toggleTileLayer}>
                  <span
                    className={this.state.tileLayerStyle === "satellite" ? "bi bi-map-fill" : "bi bi-map"}
                    style={{ fontSize: "24px", width: "24px" }}
                  />
                </Button>
                <Button fill className="map-button" onClick={this.goBackToCurrentLocation}>
                  <span
                    className="bi bi-cursor-fill"
                    id="currentLocationButton"
                    style={{ fontSize: "24px", width: "24px" }}
                  />
                </Button>
              </div>
            </div>
          }
          topBar={
            <Searchbar
              style={{ height: this.searchBarHeight, margin: 0 }}
              value={this.state.searchText}
              onFocus={e => {
                if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
                  this.setState({ snapSheetToState: 2 });
                  this.updateSearchSuggestions(e.target.value);
                  return;
                }
                if (this.focusOnSearchBar) {
                  this.focusOnSearchBar = false;
                  return;
                }
                e.target.blur();
                this.focusOnSearchBar = true;
                this.setState({ snapSheetToState: 2 });
                this.updateSearchSuggestions(e.target.value);
                e.target.focus({ preventScroll: true });
              }}
              placeholder="Ort, Adresse oder Koordinaten (lat, lng)"
              onChange={e => {
                this.setState({ searchText: e.target.value, showSearchSuggestions: true });
                this.updateSearchSuggestions(e.target.value);
              }}
              onSubmit={() => {
                document.getElementById("map")?.focus({ preventScroll: true }); // focus on map to hide keyboard
                this.updatePlaceBySearchOrOsmID(this.state.searchText);
              }}
              onClickClear={() => {
                this.setState({ searchText: "", showSearchSuggestions: false, searchSuggestions: [] });
              }}
              onClickDisable={() => {
                this.setState({ snapSheetToState: 0, showSearchSuggestions: false });
              }}
            />
          }
          scrollArea={
            <div id="scroll-area">
              <List className="mt-0" style={{ display: this.state.showSearchSuggestions ? "block" : "none" }}>
                {this.state.showSearchSuggestions &&
                  this.state.searchSuggestions.map((suggestion, index) => {
                    return (
                      <ListItem
                        key={index}
                        title={suggestion["displayName"]}
                        onClick={() => {
                          this.setState({ searchText: suggestion["displayName"], showSearchSuggestions: false });
                          this.updatePlaceBySearchOrOsmID(suggestion["displayName"], suggestion["osmID"]);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    );
                  })}
              </List>
              <BlockTitle large className="mt-0 mb-1">
                {findHumanPlaceName(this.state.place.name)}
              </BlockTitle>
              <BlockHeader>{formatAddressObject(this.state.place.address)}</BlockHeader>
              <Block
                medium
                className="route-wrapper"
                style={{ display: this.state.showRoutingDistanceAndDuration ? "flex" : "none" }}
              >
                <div className="route-left">
                  <span className="time font-bold fs-4">
                    {this.state.routingTime > 3600
                      ? Math.round(this.state.routingTime / 3600) +
                        " Std. " +
                        Math.round((this.state.routingTime % 3600) / 60) +
                        " Min."
                      : Math.round(this.state.routingTime / 60) + " Minuten"}
                  </span>
                  <span className="font-light fs-3">von aktueller Position</span>
                </div>
                <div className="route-right fs-3">
                  <span className="font-light">
                    {Math.round(this.state.routingDistance / 1000)} km{""}
                  </span>
                  <Link
                    outline
                    external
                    style={{ margin: "0 0.8rem", display: "unset" }}
                    className="google-maps-button"
                    target="_blank"
                    href={
                      "https://www.google.com/maps/dir/?api=1&origin=" +
                      this.state.currentLocation.lat +
                      "%2C" +
                      this.state.currentLocation.lng +
                      "&destination=" +
                      this.state.selectedCoords.lat +
                      "%2C" +
                      this.state.selectedCoords.lng
                    }
                  >
                    Google Maps
                  </Link>
                </div>
              </Block>
              <WikiInfo place={this.state.place} />
              <Block className="mt-1">
                <Button outline href="/impressum" text="Impressum" className="impressum-button"></Button>
              </Block>
            </div>
          }
        />
      </Page>
    );
  }
}

export default Home;
