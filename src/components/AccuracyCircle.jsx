import React from "react";
import { Circle } from "react-leaflet";

class AccuracyCircle extends React.Component {
  render() {
    if (
      this.props.visible === false ||
      this.props.center === undefined ||
      this.props.center === null ||
      this.props.center.lat === undefined ||
      this.props.center.lng === undefined ||
      this.props.radius === undefined ||
      this.props.radius === null
    ) {
      return null;
    }

    return (
      <Circle
        center={this.props.center}
        radius={this.props.radius}
        pathOptions={{ fill: true, fillColor: "#0000ff", fillOpacity: 0.1, color: "#0000ff", opacity: 0.2 }}
      />
    );
  }
}

// define the types of the properties that are passed to the component
AccuracyCircle.prototype.props = /** @type { { 
  visible: boolean,
  center: { lat: number, lng: number } | undefined,
  radius: number | undefined,
} } */ ({});

export default AccuracyCircle;
