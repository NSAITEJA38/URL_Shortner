export const normalizeUrl = (url) => {
  if (!url) return "";

  let trimmedUrl = url.trim();

  if (
    !trimmedUrl.startsWith("http://") &&
    !trimmedUrl.startsWith("https://")
  ) {
    trimmedUrl = `https://${trimmedUrl}`;
  }

  return trimmedUrl;
};