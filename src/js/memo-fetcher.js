/**
 * MemoFetcher is a wrapper around fetch() that caches the results.
 * The cache is stored in LocalStorage.
 */
class MemoFetcher {
  /**
   * Fetches a URL and caches the result in LocalStorage.
   * @param {string} url The URL to fetch.
   */
  async fetch(url) {
    if (localStorage.getItem(url)) {
      return JSON.parse(localStorage.getItem(url) || "{}");
    }

    const response = await fetch(url);
    const data = await response.json();
    localStorage.setItem(url, JSON.stringify(data));
    return data;
  }
}

export default MemoFetcher;
