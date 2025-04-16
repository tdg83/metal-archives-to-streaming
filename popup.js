document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("platformsContainer");
  const selftitledCheck = document.getElementById("selfTitledToggle");

  const response = await browser.runtime.sendMessage({ type: "getPlatforms" });
  const platforms = response.platforms;

  const selftitledResult = await browser.storage.local.get("replaceWithSelfTitled");
  selftitledCheck.checked = selftitledResult.replaceWithSelfTitled ?? true;

  const storedSettings = await browser.storage.local.get(platforms.map(p => p.id));

  for (const platform of platforms) {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = platform.id;
    checkbox.checked = storedSettings[platform.id] ?? true;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(`Show ${platform.title}`));
    container.appendChild(label);
  }

  document.getElementById("saveBtn").addEventListener("click", () => {
  const newSettings = {
    replaceWithSelfTitled: selftitledCheck.checked
  };

  for (const platform of platforms) {
    const checkbox = document.getElementById(platform.id);
    newSettings[platform.id] = checkbox.checked;
  }

  browser.storage.local.set(newSettings);
  browser.runtime.sendMessage({ type: "rebuildContextMenus" });
  window.close();
});

});