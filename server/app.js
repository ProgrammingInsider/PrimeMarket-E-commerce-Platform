// External Packages
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';
import path from 'path';

// Get the directory name of the current module
const __dirname = process.cwd();

// Invoke External Packages
const app = express();
dotenv.config();

// Routes
import PublicRoutes from './routes/publicRoutes.js';
import ProtectedRoutes from './routes/protectedRoutes.js';
import PrivateRoutes from './routes/privateRoutes.js';

// Middleware
import credentials from './middleware/credentials.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { privateAuth } from './middleware/privateAuth.js';
import { protectedAuth } from './middleware/protectedAuth.js';

// Config
import corsOptions from './config/corsOptions.js';
import conn from './config/db.js';

// Security Middleware
app.use(helmet());
app.use(xss());

// General Middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    createParentPath: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(credentials);
app.use(cors(corsOptions));

app.use(
  '/uploads/products',
  express.static(path.join(__dirname, 'uploads/products'))
);
app.use('/api/v1/ecommerce_portfolio/', PublicRoutes);
app.use('/api/v1/ecommerce_portfolio/', protectedAuth, ProtectedRoutes);
app.use('/api/v1/ecommerce_portfolio/', privateAuth, PrivateRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
