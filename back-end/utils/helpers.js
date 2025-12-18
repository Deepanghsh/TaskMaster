export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};