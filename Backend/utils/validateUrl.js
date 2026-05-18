import validator from "validator";

export const isValidUrl = (url) => {
  return validator.isURL(url, {
    require_protocol: true,
    protocols: ["http", "https"]
  });
};