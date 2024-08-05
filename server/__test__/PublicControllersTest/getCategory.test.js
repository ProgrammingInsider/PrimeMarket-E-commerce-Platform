import { StatusCodes } from 'http-status-codes';
import { getCategory } from '../../controllers/publicControllers.js';
import Category from '../../model/Category.js';
import { NoContentError } from '../../errors/index.js';

jest.mock('../../model/Category.js');

describe('Fetch All Category', () => {
  let Categories;
  let mockRequest;
  let mockResponse;

  beforeAll(() => {
    Categories = [
      {
        _id: '665aeda3446847bd5644edcc',
        category_name: 'Electronics',
        slug: 'electronics',
        description: 'Category for electronic devices',
        parent_category: null,
        image_url: 'https://aman.com/electronics.jpg',
        depth_level: 1,
        path: '/electronics',
        metadata: {
          color: 'blue',
          icon: 'fas fa-mobile-alt',
        },
        is_active: true,
        createdAt: '2024-06-01T09:45:07.871Z',
        updatedAt: '2024-06-01T09:45:07.871Z',
        __v: 0,
      },
      {
        _id: '665aede8446847bd5644edd0',
        category_name: 'Clothes',
        slug: 'clothes',
        description: 'Category for clothes devices',
        parent_category: null,
        image_url: 'https://aman.com/electronics.jpg',
        depth_level: 1,
        path: '/clothes',
        metadata: {
          color: 'blue',
          icon: 'fas fa-mobile-alt',
        },
        is_active: true,
        createdAt: '2024-06-01T09:46:16.694Z',
        updatedAt: '2024-06-01T09:46:16.694Z',
        __v: 0,
      },
    ];

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when fetched All Categories', async () => {
    Category.find.mockImplementation(() => ({
      sort: jest
        .fn()
        .mockResolvedValue(
          Categories.sort((a, b) => a.slug.localeCompare(b.slug))
        ),
    }));

    await getCategory(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      results: Categories,
    });
  });
});
