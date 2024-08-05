import { StatusCodes } from 'http-status-codes';
import { getProduct } from '../../controllers/privateControllers.js';
import Product from '../../model/Product.js';
import { ForbiddenError } from '../../errors/index.js';

jest.mock('../../model/Product.js');

describe('Get Product Controllers', () => {
  let mockRequest;
  let mockResponse;
  let fetchedProduct;

  beforeAll(() => {
    mockRequest = {
      user: {
        userId: '6659cfe1e6ab6334094287bf',
      },

      matchedData: {
        productId: '6661c21129290f69d89c67e1',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    fetchedProduct = {
      _id: '6661c21129290f69d89c67e1',
      name: '"Vivo 20 pro max"',
      description: '"Latest Iphone"',
      price: 699.99,
      stock: 100,
      category: '665aede8446847bd5644edd0',
      brand: '"Iphone"',
      averageRating: 1.5,
      ratingCount: 100,
      imageUrl: '1717682705373portfolio.jpg',
      weight: 1.5,
      dimensions: '"10x5x2"',
      isActive: true,
      userId: '6659cfe1e6ab6334094287bf',
      sku: 'SKU-dedf9e49-6e33-4a1b-8cba-c5e37c6865dd',
      createdAt: '2024-06-06T14:05:05.419Z',
      updatedAt: '2024-06-06T14:05:05.419Z',
      __v: 0,
    };
  });

  it('Should return 20 status codes when  the product fetched', async () => {
    await Product.findOne.mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue(fetchedProduct),
    }));

    await getProduct(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      result: fetchedProduct,
    });
  });

  it('Should throw forbidden error if the product is not found', async () => {
    await Product.findOne.mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue(null),
    }));

    await expect(getProduct(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(getProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Forbidden Request'
    );
  });
});
