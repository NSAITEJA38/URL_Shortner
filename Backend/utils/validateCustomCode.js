export const isValidCustomCode = (code) => {
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(code);
};