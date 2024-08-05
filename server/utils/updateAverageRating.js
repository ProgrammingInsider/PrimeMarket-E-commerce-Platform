export const updateAverageRating = (
  oldAverageRating,
  numberOfRatings,
  oldUserRating,
  newUserRating
) => {
  const oldTotalSumOfRatings = oldAverageRating * numberOfRatings;
  const newTotalSumOfRatings =
    oldTotalSumOfRatings - oldUserRating + newUserRating;
  const newAverageRating = newTotalSumOfRatings / numberOfRatings;
  return Math.round(newAverageRating * 10) / 10; // Round to one decimal place
};
