import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

class LocationMarker extends React.Component {
  markerIcon = L.icon({
    iconUrl: this.props.iconUrl,
    iconSize: [this.props.size.width, this.props.size.height],
    // Center of the icon:
    iconAnchor: [this.props.anchor?.x || this.props.size.width / 2, this.props.anchor?.y || this.props.size.height / 2],
  });

  render() {
    if (
      this.props.position === undefined ||
      this.props.position === null ||
      this.props.position.lat === undefined ||
      this.props.position.lng === undefined ||
      !this.props.visible
    ) {
      return null;
    }

    return <Marker position={[this.props.position.lat, this.props.position.lng]} icon={this.markerIcon} />;
  }
}

export default LocationMarker;
