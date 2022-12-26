/**
 * Get a place from nominatim response data
 * @param {any} placeData
 * @param {{ lat: number, lng: number}  | undefined } userInputCoords
 * @returns {any}
 */
export function getPlaceByNominatimData(placeData, userInputCoords) {
  if (placeData === undefined) return;
  console.log(placeData);
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
  console.log(place);
  console.log(placeData?.extratags?.wikidata);
  console.log(placeData?.extratags?.wikipedia);
  return place;
}

/**
 * Get the zoom level by a given bounding box
 * @param {number[] | string[] | undefined} boundingbox
 * @returns {number | undefined}
 * @see https://wiki.openstreetmap.org/wiki/Zoom_levels
 * @see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Zoom_levels
 */
export function getZoomByBoundingBox(boundingbox) {
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
}
