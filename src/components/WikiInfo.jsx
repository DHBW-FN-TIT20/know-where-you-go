import { Block, BlockTitle } from "framework7-react";
import { getPlaceByNominatimData } from "../js/helpers";

import React from "react";

class WikiInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      noInfoFound: false,
      title: "",
      description: "",
      image: "",
      noPlaceGiven: true,
    };
    this.place = props.place;
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.place.name === this.props.place.name &&
      prevProps.place.wikidata === this.props.place.wikidata &&
      prevProps.place.wikipedia === this.props.place.wikipedia &&
      prevProps.place.zoomLevel === this.props.place.zoomLevel &&
      prevProps.place.userInputCoords?.lat === this.props.place.userInputCoords?.lat &&
      prevProps.place.userInputCoords?.lng === this.props.place.userInputCoords?.lng
    ) {
      return;
    }

    this.setState({
      isLoading: true,
      noInfoFound: false,
      title: "",
      description: "",
      image: "",
      noPlaceGiven: false,
    });
    this.place = this.props.place;
    await this.loadWikiInfo(this.props.place.wikipedia, this.props.place.wikidata, this.props.place.name);
  }

  /**
   * Tries to load the wiki info by the given wikipedia tag,
   * if this fails it tries to load the info by the given wikidata id,
   * if this fails it tries to load the info by the given search text
   * It updates the state with the loaded information
   * @param {string} wikipediaTag
   * @param {string} wikidata
   * @param {string} searchText
   * @returns {Promise<void>}
   */
  async loadWikiInfo(wikipediaTag, wikidata, searchText) {
    if (wikipediaTag && (await this.loadWikiInfoByWikipediaTag(wikipediaTag))) {
      return;
    }

    if (wikidata && (await this.loadWikiInfoByWikidata(wikidata))) {
      return;
    }

    if (searchText && (await this.loadWikiInfoBySearch(searchText))) {
      return;
    }

    // if no information was found try the next smaller zoom level
    await this.takeNextBiggerPlace();
  }

  /**
   * Updates the current place with the next bigger place to search for information
   * @returns {Promise<void>}
   */
  takeNextBiggerPlace = async () => {
    const newZoomLevel = this.place.zoomLevel - 1;
    if (this.place.zoomLevel === 0) {
      this.setState({
        isLoading: false,
        noInfoFound: true,
      });
      return;
    }
    const response = await fetch(
      // eslint-disable-next-line max-len
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.place.userInputCoords.lat}&lon=${this.place.userInputCoords.lng}&extratags=1&zoom=${newZoomLevel}&addressdetails=1`,
    );
    const data = await response.json();

    if (data.error) {
      this.setState({
        isLoading: false,
        noInfoFound: true,
      });
      return;
    }
    const place = getPlaceByNominatimData(data, this.place.userInputCoords);
    this.setState({
      isLoading: true,
      noInfoFound: false,
      title: "",
      description: "",
      image: "",
    });
    place.zoomLevel = newZoomLevel;
    this.place = place;
    await this.loadWikiInfo(place.wikipedia, place.wikidata, place.name);
  };

  /**
   * Calls the wikipedia api to get the information for the given wikipedia tag
   * @param {string} wikipediaTag
   * @returns Promise<boolean> true if the information was found and loaded false if not
   */
  loadWikiInfoByWikipediaTag = async wikipediaTag => {
    if (wikipediaTag === undefined || wikipediaTag === "") return false;

    const response = await fetch(
      // eslint-disable-next-line max-len
      `https://de.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&formatversion=2&origin=*&exintro=1&explaintext=1&exsentences=3&exlimit=1&piprop=original&titles=${wikipediaTag}`,
    );
    const data = await response.json();
    if (data.query.pages === undefined || data.query.pages.length === 0) {
      return false;
    }

    this.updateInfoByWikiPage(data.query.pages[0]);
    return true;
  };

  /**
   * Calls the wikidata api to get the information for the given wikidata id
   * @param {string} wikidata
   * @returns Promise<boolean> true if the information was found and loaded false if not
   */
  loadWikiInfoByWikidata = async wikidata => {
    if (wikidata === undefined || wikidata === "") return false;

    const response = await fetch(
      // eslint-disable-next-line max-len
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&ids=${wikidata}&origin=*&sitefilter=dewiki`,
    );
    const data = await response.json();
    if (!data.entities[wikidata].sitelinks?.dewiki) {
      return false;
    }
    const wikipediaTag = data.entities[wikidata].sitelinks.dewiki.title;
    return await this.loadWikiInfoByWikipediaTag(wikipediaTag);
  };

  /**
   * Calls the wikipedia api to get the information for the given search text
   * @param {*} searchText
   * @returns Promise<boolean> true if the information was found and loaded false if not
   */
  loadWikiInfoBySearch = async searchText => {
    if (searchText === undefined || searchText === "" || searchText === "Unknown location") return false;
    const response = await fetch(
      // eslint-disable-next-line max-len
      `https://de.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&origin=*&srsearch=${searchText}`,
    );
    const data = await response.json();
    if (data.query.search?.length === 0) {
      return;
    }
    return await this.loadWikiInfoByWikipediaTag(data.query.search[0].title);
  };

  /**
   * Updates the state with the information from the given wikipedia page
   * @param {*} page
   * @returns void
   */
  updateInfoByWikiPage(page) {
    this.setState({
      isLoading: false,
      noInfoFound: false,
      title: page.title,
      description: page.extract.slice(0, 600) + (page.extract.length > 600 ? "..." : ""),
      image: page.original ? page.original.source : "",
    });
  }

  render() {
    if (this.state.noPlaceGiven) return null;

    if (this.state.isLoading) return <Block className="loading">Loading Wikipedia information...</Block>;

    if (this.state.noInfoFound) return <Block className="no-info">No Wikipedia information found.</Block>;

    return (
      <>
        <BlockTitle>{this.state.title}</BlockTitle>
        <Block>{this.state.description}</Block>
        <Block>{this.state.image && <img src={this.state.image} />}</Block>
      </>
    );
  }
}

// define the types of the properties that are passed to the component
WikiInfo.prototype.props = /** @type { { 
  place: {
    name: string,
    wikidata: string,
    wikipedia: string,
    zoomLevel: number,
    userInputCoords: {
      lat: number,
      lng: number,
    },
  }
} } */ ({});

export default WikiInfo;
