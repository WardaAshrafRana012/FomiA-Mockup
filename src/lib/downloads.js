export function download(asset, notify) {
  const a = document.createElement("a");
  a.href = asset.src;
  a.download = asset.title + ".png";
  a.click();
  notify?.("Download started");
}
