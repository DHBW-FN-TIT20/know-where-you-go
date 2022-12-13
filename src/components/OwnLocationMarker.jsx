import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

class OwnLocationMarker extends React.Component {
  markerIcon = L.icon({
    iconUrl: "../img/OwnLocationMarker.png",
    iconSize: [20, 20], // size of the icon
    iconAnchor: [10, 10], // point of the icon which will correspond to marker's location --> Middle of the icon
  });

  render() {
    return <Marker position={[this.props.position.lat, this.props.position.lng]} icon={this.markerIcon}></Marker>;
  }
}

export default OwnLocationMarker;
