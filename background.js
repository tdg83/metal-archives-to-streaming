browser.contextMenus.create({
  id: "metalarchives-to-ytmusic",
  title: "Search on YT Music",
  contexts: ["link"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "metalarchives-to-ytmusic") {
    const url = info.linkUrl;

    const match = url.match(/metal-archives\.com\/albums\/([^/]+)\/([^/?#]+)/);
    if (match) {
      const band = decodeURIComponent(match[1]).replace(/_/g, " ");
      const album = decodeURIComponent(match[2]).replace(/_/g, " ");
      const query = encodeURIComponent(`${band} ${album}`);
      const searchUrl = `https://music.youtube.com/search?q=${query}`;

      browser.tabs.create({ url: searchUrl });
    }
  }
});
