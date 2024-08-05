// Package
import { StatusCodes } from 'http-status-codes';

const notFound = (req, res) =>
  res.status(StatusCodes.NOT_FOUND).send('Route Does not exist');

export default notFound;
