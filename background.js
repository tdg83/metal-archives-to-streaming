browser.contextMenus.removeAll().then(() => {
  browser.contextMenus.create({
    id: "ytmusic",
    title: "Search on YouTube Music",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.metal-archives.com/*"],
	icons: {
		"16": "ytmusic16.png",
		"32": "ytmusic32.png"
	}
  });

  browser.contextMenus.create({
    id: "spotify",
    title: "Search on Spotify",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.metal-archives.com/*"],
	icons: {
		"16": "spotify16.png",
		"32": "spotify32.png"
	}
  });
  
  browser.contextMenus.create({
    id: "bandcamp",
    title: "Search on Bandcamp",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.metal-archives.com/*"],
	icons: {
		"16": "bandcamp16.png",
		"32": "bandcamp32.png"
	}
  });
});

browser.contextMenus.onShown.addListener((info, tab) => {
  const match = info.linkUrl?.match(/:\/\/(?:www\.)?metal-archives\.com\/albums\/([^/]+)\/([^/?#]+)/);

  if (match) {
    const band = decodeURIComponent(match[1]).replace(/_/g, " ");
    const album = decodeURIComponent(match[2]).replace(/_/g, " ");

    browser.contextMenus.update("ytmusic", {
      title: `"${band} - ${album}" on YouTube Music`
    });
    browser.contextMenus.update("spotify", {
      title: `"${band} - ${album}" on Spotify`
    });
	browser.contextMenus.update("bandcamp", {
      title: `"${band} - ${album}" on Bandcamp`
    });
  } else {
    browser.contextMenus.update("ytmusic", {
      title: "Unvalid release link selected"
    });
    browser.contextMenus.update("spotify", {
      title: "Unvalid release link selected"
    });
  }

  browser.contextMenus.refresh();
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  const url = info.linkUrl;
  const match = url.match(/:\/\/(?:www\.)?metal-archives\.com\/albums\/([^/]+)\/([^/?#]+)/);

  if (match) {
    const band = decodeURIComponent(match[1]).replace(/_/g, " ");
    const album = decodeURIComponent(match[2]).replace(/_/g, " ");
    const query = encodeURIComponent(`${band} ${album}`);

    let searchUrl;
    if (info.menuItemId === "ytmusic") {
      searchUrl = `https://music.youtube.com/search?q=${query}`;
    } else if (info.menuItemId === "spotify") {
      searchUrl = `https://open.spotify.com/search/${query}`;
	} else if (info.menuItemId === "bandcamp") {
      searchUrl = `https://bandcamp.com/search?q=${query}`;
    }

    if (searchUrl) {
      browser.tabs.create({ url: searchUrl });
    }
  }
});
