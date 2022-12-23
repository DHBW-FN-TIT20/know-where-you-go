import React from "react";
import { Page, Searchbar, List, BlockTitle } from "framework7-react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SnappingSheet from "../components/SnappingSheet";
import OwnLocationMarker from "../components/OwnLocationMarker";
import AccuracyCircle from "../components/AccuracyCircle";

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
      mapCenter: {
        lat: 47.665575312188025,
        lng: 9.447241869601651,
      },
      mapZoom: 4,
    };

    this.sheetHeightStates = [
      SEARCH_BAR_HEIGHT,
      window.innerHeight * 0.25 + SEARCH_BAR_HEIGHT,
      window.innerHeight * 0.8 + SEARCH_BAR_HEIGHT,
    ];
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
          accuracy: position.coords.accuracy,
          mapCenter: { lat: position.coords.latitude, lng: position.coords.longitude },
          mapZoom: 18,
        },
      });
      this.updatePlaceByCoords({ lat: position.coords.latitude, lng: position.coords.longitude }, 18);
    });
  }

  /*
   * Search for a place by text or coordinates
   */
  updatePlaceBySearch = async () => {
    const coords = this.getCoordsFromSearchText(this.state.searchText);

    let place = {};
    if (coords !== undefined) place = await this.getPlaceByCoords(coords);
    else place = await this.getPlaceByText(this.state.searchText);

    console.log("place in updatePlaceBySearch", place);

    if (place === undefined) return;
    this.setState({
      place: place,
      snapSheetToState: 1,
      mapCenter: {
        lat: place.realCoords.lat,
        lng: place.realCoords.lng,
      },
      mapZoom: place.zoomLevel,
    });
  };

  /**
   * Update the place by given coordinates
   * @param {{lat: number, lng: number}} coords
   * @param {number} zoom
   */
  updatePlaceByCoords = async (coords, zoom) => {
    const place = await this.getPlaceByCoords(coords, zoom);
    this.setState({
      place: place,
      snapSheetToState: 1,
      mapCenter: {
        lat: place.realCoords.lat,
        lng: place.realCoords.lng,
      },
      mapZoom: zoom,
    });
    console.log("state in updatePlaceByCoords", this.state);
  };

  /**
   * Get coordinates from a string
   * @param {string} text
   * @returns {{lat: number, lng: number} | undefined} undefined if no coordinates were found
   */
  getCoordsFromSearchText = text => {
    const coordinateRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    coordinateRegex.test(text);
    const match = text.match(coordinateRegex);
    if (!match) return undefined;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    console.log(`lat: ${lat}, lng: ${lng}`);
    return { lat: lat, lng: lng };
  };

  /**
   * Get a place from nominatim by text
   * @param {string} searchText
   * @returns Promise<Place>
   */
  getPlaceByText = async searchText => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchText}&format=json&addressdetails=1&limit=1&extratags=1`,
    );
    const data = await response.json();
    if (data[0] === undefined) return;
    const place = this.getPlaceByNominatimData(data[0]);
    return place;
  };

  /**
   * Get a place from nominatim by coordinates
   * @param {{lat: number, lng: number}} coords
   * @returns {Promise<any>}
   */
  getPlaceByCoords = async (coords, zoom = 20) => {
    const response = await fetch(
      // eslint-disable-next-line max-len
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&extratags=1&zoom=${zoom}&addressdetails=1`,
    );
    const data = await response.json();
    console.log(data);
    if (data === undefined) return;
    const place = this.getPlaceByNominatimData(data);
    if (place?.realCoords?.lat === undefined || place?.realCoords?.lng === undefined) {
      place.realCoords = coords;
    }
    return place;
  };

  /**
   * Get a place from nominatim response data
   * @param {any} placeData
   * @returns {any}
   */
  getPlaceByNominatimData = placeData => {
    if (placeData === undefined) return;
    // console.log(placeData);
    let place = {
      name: placeData?.display_name || "Unknown location",
      address: {
        amenity: placeData?.address?.amenity || "",
        city: placeData?.address?.city || "",
        cityDistrict: placeData?.address?.city_district || "",
        municipality: placeData?.address?.municipality || "",
        country: placeData?.address?.country || "",
        countryCode: placeData?.address?.country_code || "",
        neighbourhood: placeData?.address?.neighbourhood || "",
        postcode: placeData?.address?.postcode || "",
        road: placeData?.address?.road || "",
        houseNumber: placeData?.address?.house_number || "",
        state: placeData?.address?.state || "",
        suburb: placeData?.address?.suburb || "",
      },
      type: placeData?.type || "",
      importance: placeData?.importance ? parseFloat(placeData?.lat) : 0,
      osmId: placeData?.osm_id || 0,
      realCoords: {
        lat: placeData?.lat ? parseFloat(placeData?.lat) : undefined,
        lng: placeData?.lon ? parseFloat(placeData?.lon) : undefined,
      },
      userInputCoords: {
        lat: 0,
        lng: 0,
      },
      zoomLevel: this.getZoomByBoundingBox(placeData?.boundingbox) || 10,
      searchedByCoords: false,
      searchedByCurrentLocation: false,
      searchedByPlace: false,
      searchedByAddress: false,
    };
    // console.log(place);
    return place;
  };

  /**
   * Get the zoom level by a given bounding box
   * @param {number[] | string[] | undefined} boundingbox
   * @returns {number | undefined}
   * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
   * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Zoom_levels
   */
  getZoomByBoundingBox(boundingbox) {
    if (boundingbox === undefined) return undefined;

    const lat1 = parseFloat(`${boundingbox[0]}`);
    const lat2 = parseFloat(`${boundingbox[1]}`);
    const lng1 = parseFloat(`${boundingbox[2]}`);
    const lng2 = parseFloat(`${boundingbox[3]}`);
    const latDiff = Math.abs(lat1 - lat2);
    const lngDiff = Math.abs(lng1 - lng2);
    const maxDiff = Math.max(latDiff, lngDiff);
    const zoom = Math.round(Math.log(360 / maxDiff) / Math.log(2));
    return zoom;
  }

  /**
   * Small Compnent to interact with the leaflet map
   * @returns {null}
   */
  MapHook = ({ mapCenter, onCenterChange, mapZoom, onZoomChange, onClick }) => {
    const map = useMap();

    // set the center of the map to this.state.mapCenter (but let the user move it)
    map.setView(mapCenter, mapZoom, { animate: true, duration: 0.2 });

    useMapEvents({
      click: event => {
        onClick(event.latlng);
      },
      drag: () => {
        console.log("drag");
        onCenterChange(map.getCenter());
      },
      zoom: () => {
        console.log("zoom", map.getZoom());
        onCenterChange(map.getCenter());
        onZoomChange(map.getZoom());
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
          style={{ height: "100%" }}
          touchZoom={true}
          zoomControl={false}
        >
          <AccuracyCircle
            center={{ lat: this.state.currentLocation.lat, lng: this.state.currentLocation.lng }}
            radius={this.state.currentLocation.accuracy}
            visible={this.state.mapZoom >= 17}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <OwnLocationMarker
            position={this.state.currentLocation}
            visible={this.state.currentLocation.accuracy !== 0}
          />
          <this.MapHook
            mapCenter={this.state.mapCenter}
            onCenterChange={center => this.setState({ mapCenter: center })}
            mapZoom={this.state.mapZoom}
            onZoomChange={zoom => this.setState({ mapZoom: zoom })}
            onClick={async coords => await this.updatePlaceByCoords(coords, this.state.mapZoom)}
          />
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
              this.setState({ snapSheetToState: 2 });
            }}
            placeholder="Place, address, or coordinates (lat, lng)"
            onChange={event => {
              this.setState({ searchText: event.target.value });
            }}
            onSubmit={() => this.updatePlaceBySearch()}
            onClickClear={() => {
              this.setState({ searchText: "" });
            }}
          />
          <BlockTitle medium>{this.state.place.name}</BlockTitle>
          <BlockTitle>{address}</BlockTitle>

          <List></List>
        </SnappingSheet>
      </Page>
    );
  }
}

export default Home;
