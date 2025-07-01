const validateInt = (value, min = 0) => {
  const intVal = parseInt(value);
  return !isNaN(intVal) && intVal >= min ? intVal : null;
};

export const isValidInt = (value) => {
  return validateInt(value) !== null;
};

export const isValidStr = (value) => {
  return typeof value === "string" && value.trim() !== "";
};
