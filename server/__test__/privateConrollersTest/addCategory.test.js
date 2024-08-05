import { StatusCodes } from 'http-status-codes';
import { addCategory } from '../../controllers/privateControllers.js';
import Category from '../../model/Category.js';
import { BadRequestError } from '../../errors/index.js';

jest.mock('../../model/Category.js');

describe('Add category controller', () => {
  let mockRequest;
  let mockResponse;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        _csrf: '{{csrfToken}}',
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
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  it('Should return 201 status code when new category is added', async () => {
    Category.findOne.mockResolvedValue(null);
    const savedMethod = jest
      .spyOn(Category.prototype, 'save')
      .mockResolvedValue({
        _id: '123',
        ...mockRequest.matchedData,
      });

    await addCategory(mockRequest, mockResponse);
    expect(Category.findOne).toHaveBeenCalledWith({
      slug: mockRequest.matchedData.slug,
    });
    expect(Category).toHaveBeenCalledWith(mockRequest.matchedData);
    expect(savedMethod).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Category added successfully',
    });
  });

  it('should Throw Bad request error if Category is already added', async () => {
    Category.findOne.mockResolvedValue({});
    await expect(addCategory(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(addCategory(mockRequest, mockResponse)).rejects.toThrowError(
      'This Category Already Registered'
    );
  });
});
