import React from "react";
import { Polygon } from "react-leaflet";
import MemoFetcher from "../js/memo-fetcher";

class OutlinePolygon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polyLatLngs: [],
    };
    this.memoFetcher = new MemoFetcher();
  }

  async componentDidUpdate(prevProps) {
    if (this.props.placeName === prevProps.placeName) return;
    this.setState({ polyLatLngs: [] });

    // fetch the polygon outline from the OpenStreetMap API (Nominatim)
    // this is not done in the main component because loading the polygon outline
    // takes more time than the normal API call
    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://nominatim.openstreetmap.org/search?q=${this.props.placeName}&format=json&limit=1&polygon_geojson=1&polygon_threshold=0.0005`,
    );
    // check if the response is suited for a polygon outline
    if (
      data[0]?.geojson?.coordinates === undefined ||
      data[0]?.geojson?.type === undefined ||
      data[0]?.boundingbox === undefined ||
      (data[0]?.geojson?.type !== "Polygon" && data[0]?.geojson?.type !== "MultiPolygon") ||
      (data[0]?.class !== "boundary" && data[0]?.class !== "place" && data[0]?.class !== "landuse")
    ) {
      this.setState({ polyLatLngs: [] });
      return;
    }

    const latLngs = this.convertGeoJsonCoordsToLeafletLatLng(data[0].geojson.coordinates);
    this.setState({ polyLatLngs: latLngs });
  }

  /**
   * Converts the coordinates of a GeoJSON polygon to the format used by Leaflet
   * @param {number[]} coords The coordinates of the GeoJSON polygon
   * @returns {number[]} The coordinates for the Leaflet polygon
   */
  convertGeoJsonCoordsToLeafletLatLng = coords => {
    if (coords === undefined) return [];

    const transformCoords = coords => {
      if (
        Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === "number" &&
        typeof coords[1] === "number"
      ) {
        return { lat: coords[1], lng: coords[0] };
      }
      return coords.map(transformCoords);
    };

    const latLngs = transformCoords(coords);

    return latLngs;
  };

  render() {
    if (this.state.polyLatLngs.length === 0) return null;

    return (
      <Polygon
        positions={this.state.polyLatLngs}
        color="blue"
        weight={1}
        opacity={0.2}
        fillOpacity={0.05}
        smoothFactor={1}
      />
    );
  }
}

// define the types of the properties that are passed to the component
OutlinePolygon.prototype.props = /** @type { { 
  placeName: string,
} } */ ({});

export default OutlinePolygon;
