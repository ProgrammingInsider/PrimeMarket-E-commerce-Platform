import { trustedDomains } from '../config/trustedDomains.js';
import { BadRequestError } from '../errors/index.js';
export const validateURL = (url) => {
  try {
    const { hostname } = new URL(url);
    if (trustedDomains.includes(hostname)) {
      return true;
    }
  } catch (error) {
    throw new BadRequestError('Invalid URL');
  }
};
