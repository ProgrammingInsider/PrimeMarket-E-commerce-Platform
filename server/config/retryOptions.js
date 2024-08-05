export const retryOptions = {
  maxAttempts: 3,
  interval: 1000,
  onError: (error) => {
    console.error('Retry attempt failed:', error);
  },
};
