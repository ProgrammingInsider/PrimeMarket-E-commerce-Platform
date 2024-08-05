export const cartItemsReducer = (state, action) => {
  switch (action.type) {
    case "FETCH":
      return action.items;
    case "REMOVE":
      return state.filter((item) => item._id !== action.id);
    case "UPDATE":
      return state.map((item) => {
        if (item._id === action.id) {
          return { ...item, quantity: action.quantity };
        }
        return item;
      });
    default:
      return state;
  }
};
