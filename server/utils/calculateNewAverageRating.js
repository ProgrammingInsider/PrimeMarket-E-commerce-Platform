export const calculateNewAverageRating = (
  oldAverageRating,
  numberOfRatings,
  newRating
) => {
  const newAverage =
    (oldAverageRating * numberOfRatings + newRating) / (numberOfRatings + 1);
  return Math.round(newAverage * 10) / 10; // Round to one decimal place
};
