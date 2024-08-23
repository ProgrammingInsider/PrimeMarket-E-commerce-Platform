export const retryOptions = {
  maxAttempts: 4,
  interval: 1000,
  onError: (error) => {
    console.error('Retry attempt failed:', error);
  },
};
