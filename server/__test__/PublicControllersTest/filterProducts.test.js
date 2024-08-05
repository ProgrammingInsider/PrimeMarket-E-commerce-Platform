import { StatusCodes } from 'http-status-codes';
import { filterProducts } from '../../controllers/publicControllers.js';
import Product from '../../model/Product.js';

jest.mock('../../model/Product.js');

describe('Filter Products Controller', () => {
  let mockRequest;
  let mockResponse;
  let returnedData;

  beforeAll(() => {
    mockRequest = {
      query: {
        categoryid: '665aeda3446847bd5644edcc',
        rating: '1',
        lowprice: '10',
        highprice: '1000',
        sort: 'recent',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    returnedData = [
      {
        _id: '665e19acf4f97c35db299186',
        name: '"Iphone 15 pro max"',
        description: '"Latest Iphone"',
        price: 49.99,
        averageRating: 1.5,
        ratingCount: 100,
        imageUrl: '1717442988130amo crop.JPG',
      },
      {
        _id: '665e1974f4f97c35db299180',
        name: '"Iphone 15 pro max"',
        description: '"Latest Iphone"',
        price: 49.99,
        averageRating: 1.6,
        ratingCount: 100,
        imageUrl: '1717442932305amo crop.JPG',
      },
      {
        _id: '665e196ff4f97c35db29917e',
        name: '"Iphone 15 pro max"',
        description: '"Latest Iphone"',
        price: 49.99,
        averageRating: 1.4,
        ratingCount: 100,
        imageUrl: '1717442927654amo crop.JPG',
      },
      {
        _id: '665e196bf4f97c35db29917c',
        name: '"Iphone 15 pro max"',
        description: '"Latest Iphone"',
        price: 49.99,
        averageRating: 1,
        ratingCount: 100,
        imageUrl: '1717442923638amo crop.JPG',
      },
    ];
  });

  it('should return 200 status code when all queries are exist and valid', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    await Product.find.mockImplementation(() => ({
      sort: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(returnedData),
      })),
    }));
    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: mockRequest.query.categoryid,
      averageRating: {
        $gte: Number(mockRequest.query.rating),
        $lte:
          mockRequest.query.rating === 5
            ? Number(mockRequest.query.rating)
            : Number(mockRequest.query.rating) + 0.9,
      },
      price: {
        $gte: Number(mockRequest.query.lowprice),
        $lte: Number(mockRequest.query.highprice),
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      length: returnedData.length,
      status: true,
      results: returnedData,
    });
  });

  it('should return 200 status code when all queries are exist and valid expect category id query', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    mockRequest.query.categoryid = null;

    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      averageRating: {
        $gte: Number(mockRequest.query.rating),
        $lte:
          mockRequest.query.rating === 5
            ? Number(mockRequest.query.rating)
            : Number(mockRequest.query.rating) + 0.9,
      },
      price: {
        $gte: Number(mockRequest.query.lowprice),
        $lte: Number(mockRequest.query.highprice),
      },
    });
  });

  it('should return 200 status code when all queries are exist and valid expect lowprice query', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    mockRequest.query.lowprice = null;
    mockRequest.query.categoryid = '665aeda3446847bd5644edcc';

    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: mockRequest.query.categoryid,
      averageRating: {
        $gte: Number(mockRequest.query.rating),
        $lte:
          mockRequest.query.rating === 5
            ? Number(mockRequest.query.rating)
            : Number(mockRequest.query.rating) + 0.9,
      },
    });
  });

  it('should return 200 status code when all queries are exist and valid expect highprice query', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    mockRequest.query.lowprice = '10';
    mockRequest.query.highprice = null;
    mockRequest.query.categoryid = '665aeda3446847bd5644edcc';

    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: mockRequest.query.categoryid,
      averageRating: {
        $gte: Number(mockRequest.query.rating),
        $lte:
          mockRequest.query.rating === 5
            ? Number(mockRequest.query.rating)
            : Number(mockRequest.query.rating) + 0.9,
      },
    });
  });

  it('should return 200 status code when all queries are exist and valid expect rating query', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    mockRequest.query.lowprice = '10';
    mockRequest.query.highprice = '1000';
    mockRequest.query.categoryid = '665aeda3446847bd5644edcc';
    mockRequest.query.rating = null;

    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: mockRequest.query.categoryid,
      price: {
        $gte: Number(mockRequest.query.lowprice),
        $lte: Number(mockRequest.query.highprice),
      },
    });
  });

  it('should return 200 status code when all queries are exist and valid expect rating query is less than 1', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    mockRequest.query.lowprice = '10';
    mockRequest.query.highprice = '1000';
    mockRequest.query.categoryid = '665aeda3446847bd5644edcc';
    mockRequest.query.rating = 0;

    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: mockRequest.query.categoryid,
      price: {
        $gte: Number(mockRequest.query.lowprice),
        $lte: Number(mockRequest.query.highprice),
      },
    });
  });

  it('should return 200 status code when all queries are exist and valid expect rating query is greater than 5', async () => {
    mockRequest.query.rating = Math.floor(mockRequest.query.rating);
    mockRequest.query.lowprice = '10';
    mockRequest.query.highprice = '1000';
    mockRequest.query.categoryid = '665aeda3446847bd5644edcc';
    mockRequest.query.rating = 6;

    await filterProducts(mockRequest, mockResponse);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: mockRequest.query.categoryid,
      price: {
        $gte: Number(mockRequest.query.lowprice),
        $lte: Number(mockRequest.query.highprice),
      },
    });
  });
});
