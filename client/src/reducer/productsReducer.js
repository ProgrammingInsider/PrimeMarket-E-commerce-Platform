export const productsReducer = (state, action) => {
  switch (action.type) {
    case "FETCH":
      return action.products;
    case "REMOVE":
      return state.filter((item) => item.publicId !== action.publicId);
    default:
      return state;
  }
};
