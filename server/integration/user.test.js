import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import app from '../app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { deleteCloudinaryImage } from '../utils/deleteCloudinaryImage.js';
import { deleteImage } from '../utils/deleteImageLocally.js';

describe('Create new User', () => {
  let csrfToken;
  let refreshToken;
  let userId;
  let authorization;
  let bannerPublicId;
  let profilePublicId;

  let signupBody = {
    firstname: 'Amanuel',
    lastname: 'Abera',
    email: 'amanuelabera46@gmail.com',
    phone: '0922112208',
    password: '!!Aman2208!!',
    confirmpassword: '!!Aman2208!!',
    street: 'Africa Avenue Road',
    city: 'Addis Ababa',
    state: 'Addis Ababa',
    postalcode: '23035',
    country: 'Ethiopia',
  };

  let updateTo = {
    firstname: 'Boxo',
    lastname: 'Abera',
    email: 'boxoabera46@gmail.com',
    phone: '0922112208',
    street: 'Africa Avenue Road',
    city: 'Addis Ababa',
    state: 'Addis Ababa',
    postalcode: '23035',
    country: 'Ethiopia',
  };

  let signinBody = {
    _csrf: csrfToken,
    email: 'amanuelabera46@gmail.com',
    password: '!!Aman2208!!',
  };

  const connectWithRetry = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        // await mongoose.connect(process.env.TEST_DB);
        await mongoose.connect("mongodb+srv://myname:pass123@cluster0.zr4z4es.mongodb.net/EcommerceTest?retryWrites=true&w=majority&appName=Cluster0");
        console.log('Connected to Test Database');
        return;
      } catch (err) {
        console.log(`Connection attempt ${i + 1} failed: ${err}`);
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error('Could not connect to the database after several attempts');
  };

  beforeAll(async () => {
    console.log(
      'Existing Mongoose connection state:',
      mongoose.connection.readyState
    );

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected existing Mongoose connection');
    }

    await connectWithRetry();

    console.log(
      'New Mongoose connection state:',
      mongoose.connection.readyState
    );

    // Retrieve CSRF token
    // const res = await request(app).get("/api/v1/ecommerce_portfolio/csrftoken");
    // csrfToken = res.body.csrfToken;
    // console.log("Retrieved CSRF Token:", csrfToken);
  });

  describe('Create new user', () => {
    it('should create new user', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signup')
        .send({ ...signupBody, _csrf: csrfToken });

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('User Registered Successfully');
    });
  });

  describe('Create new user', () => {
    it('Should throw bad request error if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signup')
        .send({
          ...signupBody,
          confirmpassword: '!!Boxo2208!!',
          _csrf: csrfToken,
        });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Passwords do not match');
    });
  });

  describe('Create new user', () => {
    it('Should throw convention error if Email is already registered', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signup')
        .send({
          ...signupBody,
          confirmpassword: '!!Aman2208!!',
          _csrf: csrfToken,
        });

      expect(res.statusCode).toBe(StatusCodes.CONFLICT);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Email address is already registered');
    });
  });

  describe('Login User Endpoint', () => {
    it('Should throw Log in Successfully if Email and password is valid', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signin')
        .send({ ...signinBody, _csrf: csrfToken });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Logged In successfully');

      // Capture the refreshToken from the response cookies
      const cookies = res.headers['set-cookie'];
      const refreshTokenCookie = cookies.find((cookie) =>
        cookie.startsWith('refreshToken=')
      );
      refreshToken = refreshTokenCookie.split(';')[0].split('=')[1]; // Extract the actual token value
      authorization = res.body.accessToken;
      userId = res.body.userId;
    });
  });

  describe('Login User Endpoint', () => {
    it('Should throw  Un authenticated If Email is not registered Before', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signin')
        .send({ ...signinBody, _csrf: csrfToken, email: 'aman@gmail.com' });

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Email address is not registered');
    });
  });

  describe('Login User Endpoint', () => {
    it('Should throw  Un authenticated If Password is Incorrect', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signin')
        .send({
          ...signinBody,
          _csrf: csrfToken,
          email: 'amanuelabera46@gmail.com',
          password: '!!Boxo2208!!',
        });

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Incorrect Password');
    });
  });

  describe('Refresh Token Endpoint', () => {
    it('Should generate new access token if refresh token is not expired', async () => {
      const res = await request(app)
        .get('/api/v1/ecommerce_portfolio/refreshtoken')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.firstname).toBe('Amanuel');
      expect(res.body.lastname).toBe('Abera');
    });
  });

  describe('Refresh Token Endpoint', () => {
    it('Should throw Forbidden Error If refresh token is not set on cookie', async () => {
      const res = await request(app).get(
        '/api/v1/ecommerce_portfolio/refreshtoken'
      );

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Forbidden Request');
    });
  });

  describe('Private User Information', () => {
    it('Should return 200 when user profile Updated', async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getprofile/${userId}`)
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.result._id).toBe(userId);
      expect(res.body.result.password).not.toBeDefined();
      expect(res.body.result.refreshToken).not.toBeDefined();
    });
  });

  describe('Update Profile User Information', () => {
    it('Should return 200 when user profile fetched', async () => {
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updateprofile`)
        .send({
          _id: userId,
          ...updateTo,
        })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('User Profile Updated');
    });

    it('Should throw 403 forbidden request when ID mismatch', async () => {
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updateprofile`)
        .send({
          _id: userId,
          ...updateTo,
        })
        .set('authorization', `Bearer abc123`);

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Forbidden Request');
    });
  });

  describe('Update Profile Banner From Locally', () => {
    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getprofile/${userId}`)
        .set('authorization', `Bearer ${authorization}`);

      bannerPublicId = res.body.result.bannerPublicId;
      profilePublicId = res.body.result.profilePublicId;
    });

    it('Should return 200 when user Banner is updated', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebanner`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', bannerPublicId)
        .attach('bannerPic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Banner Picture updated');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebanner`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', 'abc.png')
        .attach('bannerPic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('User Not Found');
    });
  });

  describe('Update Profile Picture From Locally', () => {
    it('Should return 200 when user Profile Picture is updated', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updateprofilepic`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', profilePublicId)
        .attach('profilePic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Profile Picture updated');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updateprofilepic`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', 'abc.png')
        .attach('profilePic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('User Not Found');
    });
  });

  describe('Delete Banner From Locally', () => {
    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getprofile/${userId}`)
        .set('authorization', `Bearer ${authorization}`);

      bannerPublicId = res.body.result.bannerPublicId;
      profilePublicId = res.body.result.profilePublicId;
    });

    it('Should return 200 when user Banner is updated', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteBanner`)
        .send({ publicId: bannerPublicId })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Banner Image Deleted');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteBanner`)
        .send({ publicId: 'abc.png' })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('User Not Found');
    });
  });

  describe('Delete Profile Picture From Locally', () => {
    it('Should return 200 when user Profile Picture is deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteprofilepic`)
        .send({ publicId: profilePublicId })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Profile Picture Deleted');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteprofilepic`)
        .send({ publicId: 'profiles/abc' })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('User Not Found');
    });
  });

  // Update Cloudinary
  describe('Update Profile Banner From Cloudinary', () => {
    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getprofile/${userId}`)
        .set('authorization', `Bearer ${authorization}`);

      bannerPublicId = res.body.result.bannerPublicId;
      profilePublicId = res.body.result.profilePublicId;
    });

    it('Should throws 400 bad request when No files were uploaded', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/null.jpg');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebannerfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', bannerPublicId)
        .attach('bannerPic', '');

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('No files were uploaded.');
    });

    it('Should throws 400 bad request when exceed file size limit', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/large.jpg');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebannerfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', bannerPublicId)
        .attach('bannerPic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe(
        'File size exceeds the limit. It should be 5MB maximum.'
      );
    });

    it('Should throws 400 bad request when invalid file type', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/Home.pdf');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebannerfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', bannerPublicId)
        .attach('bannerPic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Invalid File Extension');
    });

    it('Should return 200 when user Banner is updated', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebannerfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', bannerPublicId)
        .attach('bannerPic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Banner Picture updated');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatebannerfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', 'abc.png')
        .attach('bannerPic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('User Not Found');
    });
  });

  describe('Update Profile Picture From Cloudinary', () => {
    it('Should return 200 when user Profile Picture is updated', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updateprofilepicfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', profilePublicId)
        .attach('profilePic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Profile Picture updated');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updateprofilepicfromcloudinary`)
        .set('authorization', `Bearer ${authorization}`)
        .field('oldPublicId', 'abc.png')
        .attach('profilePic', imagePath);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('User Not Found');
    });
  });

  describe('Delete Banner From Cloudinary', () => {
    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getprofile/${userId}`)
        .set('authorization', `Bearer ${authorization}`);

      bannerPublicId = res.body.result.bannerPublicId;
      profilePublicId = res.body.result.profilePublicId;
    });

    it('Should return 200 when user Banner is deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deletebannerfromcloudinary`)
        .send({ publicId: bannerPublicId })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Banner Image Deleted');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deletebannerfromcloudinary`)
        .send({ publicId: 'banners/nbxmt9mwmh4s4xcxdqyk' })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe(
        'Banner Image Not Deleted from Cloudinary, please try again'
      );
    });
  });

  describe('Delete Profile Picture From Cloudinary', () => {
    it('Should return 200 when user Profile Picture is deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteprofilepicfromcloudinary`)
        .send({ publicId: profilePublicId })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Profile Picture Deleted');
    });

    it('Should throw 400 status code bad request when user not found', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteprofilepicfromcloudinary`)
        .send({ publicId: 'profiles/nbxmt9mwmh4s4xcxdqyk' })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe(
        'Profile Picture Not Deleted from Cloudinary, please try again'
      );
    });
  });

  afterAll(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany();
    }

    await mongoose.connection.close();
  });
});
