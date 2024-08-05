// package
import { StatusCodes } from 'http-status-codes';
// controller
import { signupUser } from '../../controllers/publicControllers.js';

// modules
import User from '../../model/User.js';

// Error
import { BadRequestError, ConventionError } from '../../errors/index.js';

// Mock User model
jest.mock('../../model/User.js');

describe('Signup User Controller', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    (mockRequest = {
      matchedData: {
        firstname: 'Boxo',
        lastname: 'Abera',
        email: 'boxo2@gmail.com',
        phone: '0922112208',
        password: '!!Boxo2208!!',
        confirmpassword: '!!Boxo2208!!',
        street: 'Africa Avenue Road',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        postalcode: '23035',
        country: 'Ethiopia',
      },
    }),
      (mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      });
  });

  it('Should throw bad request error if passwords are mismatch', async () => {
    mockRequest.matchedData.confirmpassword = '!!Boxo2208!';

    await expect(signupUser(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(signupUser(mockRequest, mockResponse)).rejects.toThrowError(
      'Passwords do not match'
    );
  });

  it('should throw convention error if user exist already', async () => {
    User.findOne.mockResolvedValue({});
    await expect(signupUser(mockRequest, mockResponse)).rejects.toThrow(
      ConventionError
    );
    await expect(signupUser(mockRequest, mockResponse)).rejects.toThrowError(
      'Email address is already registered'
    );
    expect(User.findOne).toHaveBeenCalledWith({
      email: mockRequest.matchedData.email,
    });
    expect(User.findOne).toHaveBeenCalled();
  });

  it('Should return 200 status code when new user registered', async () => {
    const {
      firstname,
      lastname,
      email,
      phone,
      password,
      street,
      city,
      state,
      postalcode,
      country,
    } = mockRequest.matchedData;

    const address = { street, city, state, postalcode, country };

    User.findOne.mockResolvedValue(null);
    await signupUser(mockRequest, mockResponse);

    const savedMethod = jest
      .spyOn(User.prototype, 'save')
      .mockResolvedValueOnce({
        _id: '123',
        firstname,
        lastname,
        email,
        phone,
        password,
        address,
      });

    expect(User.findOne).toHaveBeenCalledWith({
      email: mockRequest.matchedData.email,
    });
    expect(User).toHaveBeenCalledWith({
      firstname,
      lastname,
      email,
      phone,
      password,
      address,
    });
    expect(savedMethod).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'User Registered Successfully',
    });
    // expect(User.mock.instances[0].save).toHaveBeenCalled();
  });
});
