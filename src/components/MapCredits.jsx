import { Link } from "framework7-react";
import React from "react";

class MapCredits extends React.Component {
  render() {
    return (
      <div className={"map-credits pointer-all"}>
        <Link href={"https://leafletjs.com/"} external target="_blank">
          Leaflet
        </Link>
        <div>&nbsp;{"|"}&nbsp;</div>
        <div>Tiles © {this.props.tileProvider}</div>
      </div>
    );
  }
}

export default MapCredits;
