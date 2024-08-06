import allowedOrigins from '../config/allowedOrigins.js';

const credentials = (req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    // res.setHeader('Access-Control-Allow-Credentials', 'true');
    // res.setHeader(
    //   'Access-Control-Allow-Headers',
    //   'Content-Type, Authorization'
    // );
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  next();
};

export default credentials;
