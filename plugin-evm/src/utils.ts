export const round = (num) => {
  const arr = num.split(".");
  const firstPart = arr[0];
  const secondPart = arr[1].substring(0, 2);
  return firstPart + "." + secondPart;
};
