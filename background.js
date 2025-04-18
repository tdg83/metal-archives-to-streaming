const platforms = [
    {
      id: "ytmusic",
      title: "YouTube Music",
	  urlPrefix: "https://music.youtube.com/search?q=",
      icons: {
        "16": "streaming_icons/ytmusic16.png",
        "32": "streaming_icons/ytmusic32.png"
      }
    },
    {
      id: "spotify",
      title: "Spotify",
	  urlPrefix: "https://open.spotify.com/search/",
      icons: {
        "16": "streaming_icons/spotify16.png",
        "32": "streaming_icons/spotify32.png"
      }
    },
    {
      id: "bandcamp",
      title: "Bandcamp",
	  urlPrefix: "https://bandcamp.com/search?q=",
      icons: {
        "16": "streaming_icons/bandcamp16.png",
        "32": "streaming_icons/bandcamp32.png"
      }
    },
	{
      id: "applemusic",
      title: "Apple Music",
	  urlPrefix: "https://music.apple.com/us/search?term=",
      icons: {
        "16": "streaming_icons/applemusic16.png",
        "32": "streaming_icons/applemusic32.png"
      }
    },
	{
      id: "deezer",
      title: "Deezer",
	  urlPrefix: "https://www.deezer.com/search/",
      icons: {
        "16": "streaming_icons/deezer16.png",
        "32": "streaming_icons/deezer32.png"
      }
    },
	{
      id: "soundcloud",
      title: "Soundcloud",
	  urlPrefix: "https://soundcloud.com/search?q=",
      icons: {
        "16": "streaming_icons/soundcloud16.png",
        "32": "streaming_icons/soundcloud32.png"
      }
    },
	{
      id: "amazonmusic",
      title: "Amazon Music",
	  urlPrefix: "https://www.amazon.com/music/player/search/",
      icons: {
        "16": "streaming_icons/amazonmusic16.png",
        "32": "streaming_icons/amazonmusic32.png"
      }
    },
	{
      id: "tidal",
      title: "Tidal",
	  urlPrefix: "https://tidal.com/search/",
      icons: {
        "16": "streaming_icons/tidal16.png",
        "32": "streaming_icons/tidal32.png"
      }
    },
];

const applySelfTitled = async (band, album) => {
  const { replaceWithSelfTitled } = await browser.storage.local.get("replaceWithSelfTitled");
  if ((replaceWithSelfTitled ?? true) && band === album) {
    return "self-titled";
  }
  return album;
};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getPlatforms") {
    sendResponse({ platforms });
  }
  if (message.type === "rebuildContextMenus") {
    rebuildContextMenus();
  }
});

async function rebuildContextMenus() {
  await browser.contextMenus.removeAll();
  
  browser.contextMenus.create({
		id: "searchma",
		title: "Search selection on Metal Archives",
		contexts: ["selection", "link"]
	});


  browser.contextMenus.create({
    id: "streamingSearch",
    title: "Metal Archives to streaming",
    contexts: ["link"],
    documentUrlPatterns: ["*://*.metal-archives.com/*"]
  });

  for (const platform of platforms) {
    const result = await browser.storage.local.get(platform.id);
    const showService = result[platform.id] ?? true;

    browser.contextMenus.create({
      visible: showService,
      id: platform.id,
      parentId: "streamingSearch",
      title: `Search on ${platform.title}`,
      contexts: ["link"],
      documentUrlPatterns: ["*://*.metal-archives.com/*"],
      icons: platform.icons
    });
  }
}

rebuildContextMenus();

browser.contextMenus.onShown.addListener(async (info, tab) => {
  const pageUrl = tab?.url ?? "";

  const onMetalArchives = /:\/\/(?:www\.)?metal-archives\.com/.test(pageUrl);
  await browser.contextMenus.update("searchma", {
    visible: !onMetalArchives
  });
  
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
	if (info.menuItemId === "searchma") {
		if (info.selectionText) {
			const query = encodeURIComponent(info.selectionText).trim();
			const sUrl = `https://www.metal-archives.com/search?searchString=${query}&type=band_name`;
			browser.tabs.create({ url: sUrl });
		}
	} else {
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
	}
});