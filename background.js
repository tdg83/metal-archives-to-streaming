const platforms = [
    {
      id: "ytmusic",
      title: "YouTube Music",
	  urlPrefix: "https://music.youtube.com/search?q=",
      icons: {
        "16": "ytmusic16.png",
        "32": "ytmusic32.png"
      }
    },
    {
      id: "spotify",
      title: "Spotify",
	  urlPrefix: "https://open.spotify.com/search/",
      icons: {
        "16": "spotify16.png",
        "32": "spotify32.png"
      }
    },
    {
      id: "bandcamp",
      title: "Bandcamp",
	  urlPrefix: "https://bandcamp.com/search?q=",
      icons: {
        "16": "bandcamp16.png",
        "32": "bandcamp32.png"
      }
    }
];
const applySelfTitled = async (band, album) => {
  const { replaceWithSelfTitled } = await browser.storage.local.get("replaceWithSelfTitled");
  if ((replaceWithSelfTitled ?? true) && band === album) {
    return "self-titled";
  }
  return album;
};


browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    id: "streamingSearch",
    title: "Metal Archives to streaming",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.metal-archives.com/*"]
  });
  
  for (const platform of platforms) {
    browser.contextMenus.create({
      id: platform.id,
      parentId: "streamingSearch",
      title: `Search on ${platform.title}`,
      contexts: ["link"],
      documentUrlPatterns: ["*://*.metal-archives.com/*"],
      icons: {
        "16": platform.id+"16.png",
        "32": platform.id+"32.png"
      }
    });
  }
});

browser.contextMenus.onShown.addListener(async (info, tab) => {
  const match = info.linkUrl?.match(/:\/\/(?:www\.)?metal-archives\.com\/albums\/([^/]+)\/([^/?#]+)/);

  if (match) {
    const band = decodeURIComponent(match[1]).replace(/_/g, " ");
	let album = decodeURIComponent(match[2]).replace(/_/g, " ");
	album = await applySelfTitled(band, album);

    await browser.contextMenus.update("streamingSearch", {
      title: `"${band} - ${album}"`
    });
  } else {
    await browser.contextMenus.update("streamingSearch", {
      title: `No valid release link found`
    });
  }

  browser.contextMenus.refresh();
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl;
  const match = url.match(/:\/\/(?:www\.)?metal-archives\.com\/albums\/([^/]+)\/([^/?#]+)/);

  if (match) {
    const band = decodeURIComponent(match[1]).replace(/_/g, " ");
    let album = decodeURIComponent(match[2]).replace(/_/g, " ");
    album = await applySelfTitled(band, album);

    const query = encodeURIComponent(`${band} ${album}`);
    const platform = platforms.find(p => p.id === info.menuItemId);
    if (platform) {
      let searchUrl = `${platform.urlPrefix}${query}`;
      browser.tabs.create({ url: searchUrl });
    }
  }
});
