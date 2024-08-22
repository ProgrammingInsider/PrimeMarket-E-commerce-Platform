import app from './app.js';

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`the app listening on ${PORT} port`);
});
