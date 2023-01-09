/**
 * MemoFetcher is a wrapper around fetch() that caches the results.
 * The cache is stored in LocalStorage.
 */
class MemoFetcher {
  maxEntries = 1000;

  constructor() {
    if (!localStorage) {
      throw new Error("LocalStorage is not supported.");
    }

    // Remove old entries if we have too many
    this.limitEntries();
  }

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
    this.limitEntries();
    return data;
  }

  /**
   * Removes old entries from LocalStorage if we have too many
   */
  limitEntries() {
    if (localStorage.length <= this.maxEntries) return;

    for (let i = 0; i < localStorage.length - this.maxEntries; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorage.removeItem(key);
      }
    }
  }
}

export default MemoFetcher;
