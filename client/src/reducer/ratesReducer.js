export const ratesReducer = (state, action) => {
  switch (action.type) {
    case "FETCH":
      return action.comments;
      
    case "UPDATE": {
      const existingCommentIndex = state.findIndex(
        (comment) => comment.user._id === action.id,
      );
      if (existingCommentIndex !== -1) {
        return state.map((comment, index) =>
          index === existingCommentIndex
            ? { ...comment, ...action.addComment, updatedAt: "Now" }
            : comment,
        );
      } else {
        return [{ ...action.addComment, updatedAt: "Now" }, ...state];
      }
    }

    default:
      return state;
  }
};
