export const validateExpiryDate = (expiresAt) => {
  if (!expiresAt) {
    return {
      isValid: true,
      expiryDate: null,
      message: ""
    };
  }

  const expiryDate = new Date(expiresAt);

  if (isNaN(expiryDate.getTime())) {
    return {
      isValid: false,
      expiryDate: null,
      message: "Invalid expiry date"
    };
  }

  if (expiryDate <= new Date()) {
    return {
      isValid: false,
      expiryDate: null,
      message: "Expiry date must be a future date"
    };
  }

  return {
    isValid: true,
    expiryDate,
    message: ""
  };
};