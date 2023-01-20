/**
 * Get a place from nominatim response data
 * @param {any} placeData
 * @param {{ lat: number, lng: number}  | undefined } userInputCoords
 * @returns {any}
 */
export const getPlaceByNominatimData = (placeData, userInputCoords) => {
  if (placeData === undefined) return;

  const convertLongOsmTypeTo1Letter = osmType => {
    switch (osmType) {
      case "node":
        return "N";
      case "way":
        return "W";
      case "relation":
        return "R";
      default:
        return "";
    }
  };

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
    osmId:
      placeData?.osm_type && placeData?.osm_id
        ? `${convertLongOsmTypeTo1Letter(placeData?.osm_type)}${placeData?.osm_id}`
        : "",
    realCoords: {
      lat: placeData?.lat ? parseFloat(placeData?.lat) : undefined,
      lng: placeData?.lon ? parseFloat(placeData?.lon) : undefined,
    },
    userInputCoords: {
      lat: userInputCoords?.lat ? userInputCoords.lat : placeData?.lat ? parseFloat(placeData?.lat) : undefined,
      lng: userInputCoords?.lng ? userInputCoords.lng : placeData?.lon ? parseFloat(placeData?.lon) : undefined,
    },
    zoomLevel: getZoomByBoundingBox(placeData?.boundingbox) || 10,
    wikidata: placeData?.extratags?.wikidata || "",
    wikipedia: placeData?.extratags?.wikipedia || "",
    searchedByCoords: false,
    searchedByCurrentLocation: false,
    searchedByPlace: false,
    searchedByAddress: false,
  };
  return place;
};

/**
 * Get the zoom level by a given bounding box
 * @param {number[] | string[] | undefined} boundingbox
 * @returns {number | undefined}
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Zoom_levels
 */
export const getZoomByBoundingBox = boundingbox => {
  if (boundingbox === undefined) return undefined;

  const lat1 = parseFloat(`${boundingbox[0]}`);
  const lat2 = parseFloat(`${boundingbox[1]}`);
  const lng1 = parseFloat(`${boundingbox[2]}`);
  const lng2 = parseFloat(`${boundingbox[3]}`);
  const latDiff = Math.abs(lat1 - lat2);
  const lngDiff = Math.abs(lng1 - lng2);
  const maxDiff = Math.max(latDiff, lngDiff);
  const zoom = Math.min(Math.round(Math.log(360 / maxDiff) / Math.log(2)), 18);
  return zoom;
};

/**
 * Get coordinates from a string
 * @param {string} text
 * @returns {{lat: number, lng: number} | undefined} undefined if no coordinates were found
 */
export const getCoordsFromSearchText = text => {
  const coordinateRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  coordinateRegex.test(text);
  const match = text.match(coordinateRegex);
  if (!match) return undefined;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[3]);
  return { lat: lat, lng: lng };
};

/**
 * Saves a object to local storage
 * @param {string} key
 * @param {Object} object
 * @returns void
 */
export const saveObjectToLocalStorage = (key, object) => {
  if (key === undefined || key === null || key === "") return;
  if (object === undefined || object === null) return;
  localStorage.setItem(key, JSON.stringify(object));
};

/**
 * Gets a object from local storage
 * @param {string} key
 * @returns {Object | undefined}
 */
export const getObjectFromLocalStorage = key => {
  if (key === undefined || key === null || key === "") return;
  if (localStorage.getItem(key) === null) return undefined;
  const object = JSON.parse(localStorage.getItem(key) || "{}");
  return object;
};

/**
 * Checks if a object exists in local storage
 * @param {string} key
 * @returns {boolean}
 */
export const objectExistsInLocalStorage = key => {
  if (key === undefined || key === null || key === "") return false;
  const object = getObjectFromLocalStorage(key);
  return object !== null;
};

/**
 * Removes a object from local storage
 * @param {string} key
 * @returns void
 */
export const removeObjectFromLocalStorage = key => {
  if (key === undefined || key === null || key === "") return;
  localStorage.removeItem(key);
};

/**
 * Removes all objects from local storage
 * @returns void
 */
export const removeAllObjectsFromLocalStorage = () => {
  localStorage.clear();
};

/**
 * Formats the address object into a human readable string
 * @param {Object} addressObject
 * @returns {string}
 */
export const formatAddressObject = addressObject => {
  // address object -> string
  let address = "";
  if (addressObject !== undefined) {
    if (addressObject.road !== undefined && addressObject.road !== "") {
      address += addressObject.road;
      address +=
        addressObject.houseNumber !== undefined && addressObject.houseNumber !== ""
          ? ` ${addressObject.houseNumber}`
          : "";
    }
    if (address === "") {
      address +=
        addressObject.postcode !== undefined && addressObject.postcode !== "" ? `${addressObject.postcode}` : "";
    } else {
      address +=
        addressObject.postcode !== undefined && addressObject.postcode !== "" ? `, ${addressObject.postcode}` : "";
    }
    if (address === "") {
      address += addressObject.city !== undefined && addressObject.city !== "" ? `${addressObject.city}` : "";
    } else {
      address += addressObject.city !== undefined && addressObject.city !== "" ? ` ${addressObject.city}` : "";
    }
    if (address === "") {
      address +=
        addressObject.municipality !== undefined && addressObject.municipality !== ""
          ? `${addressObject.municipality}`
          : "";
    } else {
      address +=
        addressObject.municipality !== undefined && addressObject.municipality !== ""
          ? `, ${addressObject.municipality}`
          : "";
    }
    if (address === "") {
      address += addressObject.state !== undefined && addressObject.state !== "" ? `${addressObject.state}` : "";
    } else {
      address += addressObject.state !== undefined && addressObject.state !== "" ? `, ${addressObject.state}` : "";
    }
    if (address === "") {
      address += addressObject.country !== undefined && addressObject.country !== "" ? `${addressObject.country}` : "";
    } else {
      address +=
        addressObject.country !== undefined && addressObject.country !== "" ? `, ${addressObject.country}` : "";
    }
  }

  return address;
};

/**
 * Finds a fitting location name
 * @returns {string}
 */
export const findHumanPlaceName = rawName => {
  if (rawName === undefined) {
    return "";
  }

  let name = rawName.split(",")[0];
  if (!isNaN(parseInt(name))) {
    name = rawName.split(",")[1] + " " + name;
  } else if (name.length < 4) {
    if (!isNaN(parseInt(rawName.split(",")[1])) && rawName.split(",")[2] !== undefined) {
      name = name + ", " + rawName.split(",")[2] + " " + rawName.split(",")[1];
    } else {
      name = name + ", " + rawName.split(",")[1];
    }
  }
  return name;
};
