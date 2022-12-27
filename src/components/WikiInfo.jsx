import { Block, BlockTitle } from "framework7-react";
import { getPlaceByNominatimData } from "../js/helpers";

import React from "react";
import MemoFetcher from "../js/memo-fetcher";

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
    this.memoFetcher = new MemoFetcher();
  }

  async componentDidUpdate(prevProps) {
    // if nothing changed do nothing
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

    // if no place was given show nothing
    if (
      this.props.place.name === undefined ||
      this.props.place.name === "" ||
      this.props.place.userInputCoords === undefined ||
      this.props.place.userInputCoords.lat === undefined ||
      this.props.place.userInputCoords.lng === undefined
    ) {
      this.setState({
        isLoading: false,
        noInfoFound: false,
        noPlaceGiven: true,
      });
      return;
    }

    // if a new place was given load the information
    this.setState({
      isLoading: true,
      noInfoFound: false,
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

    // TODO: try out if results are better with or without the text search
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

    // if the zoom level is 0 no information was found
    if (this.place.zoomLevel === 0) {
      this.setState({
        isLoading: false,
        noInfoFound: true,
      });
      return;
    }

    // get the new place information
    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.place.userInputCoords.lat}&lon=${this.place.userInputCoords.lng}&extratags=1&zoom=${newZoomLevel}&addressdetails=1`,
    );
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

    // update the place information and try to load the wiki info again
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

    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://de.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&formatversion=2&origin=*&exintro=1&explaintext=1&exsentences=3&exlimit=1&piprop=original&titles=${wikipediaTag}`,
    );
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

    // get the wikipedia tag for the given wikidata id in the preferred language
    const preferredLanguageWiki = "dewiki";
    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&ids=${wikidata}&origin=*&sitefilter=${preferredLanguageWiki}`,
    );
    if (!data.entities[wikidata]?.sitelinks[preferredLanguageWiki]) {
      return false;
    }

    // load the information for the wikipedia tag
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
    const data = await this.memoFetcher.fetch(
      // eslint-disable-next-line max-len
      `https://de.wikipedia.org/w/api.php?action=query&format=json&list=search&formatversion=2&origin=*&srsearch=${searchText}`,
    );
    if (data.query?.search?.length === 0) {
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

export default WikiInfo;
