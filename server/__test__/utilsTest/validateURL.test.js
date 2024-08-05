import { trustedDomains } from '../../config/trustedDomains.js';
import { BadRequestError } from '../../errors/index.js';
import { validateURL } from '../../utils/validateURL.js';

describe('Validate URL Utils', () => {
  it('Should return true if the the URL is among truested domains', async () => {
    const url = 'https://www.aman.com';

    expect(validateURL(url)).toBeTruthy();
  });

  it('Should throw bad request error if the not url is among the trusted domians', async () => {
    const url = 'https://www.aman1.com';

    try {
      validateURL(url);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.message).toBe('Invalid URL');
    }
  });
});
