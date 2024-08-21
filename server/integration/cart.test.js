import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import app from '../app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import { StatusCodes } from 'http-status-codes';
import { roles } from '../config/roles.js';

describe('Create new User', () => {
  let csrfToken;
  let authorization;
  let categoryID;
  let productID1;
  let publicID1;
  let userId;
  let cartId;

  let signupBody = {
    firstname: 'Amanuel',
    lastname: 'Abera',
    email: 'amanuelabera47@gmail.com',
    phone: '0922112208',
    password: '!!Aman2208!!',
    confirmpassword: '!!Aman2208!!',
    street: 'Africa Avenue Road',
    city: 'Addis Ababa',
    state: 'Addis Ababa',
    postalcode: '23035',
    country: 'Ethiopia',
  };

  let signinBody = {
    _csrf: csrfToken,
    email: 'amanuelabera47@gmail.com',
    password: '!!Aman2208!!',
  };

  let categoryBody = {
    _csrf: '{{csrfToken}}',
    category_name: 'Clothes',
    slug: 'clothes',
    description: 'Category for clothes devices',
    parent_category: null,
    image_url: 'https://www.aman.com/electronics.jpg',
    depth_level: 1,
    path: '/clothes',
    metadata: {
      color: 'blue',
      icon: 'fas fa-mobile-alt',
    },
    is_active: true,
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
  });

  describe('Create new User Endpoint', () => {
    it('Should create new user', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signup')
        .send({ ...signupBody, _csrf: csrfToken });

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('User Registered Successfully');
    });
  });

  describe('Login Endpoint', () => {
    it('Should log in when email and password is valid', async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/signin')
        .send({ ...signinBody, _csrf: csrfToken });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Logged In successfully');

      authorization = res.body.accessToken;
      userId = res.body.userId;
    });
  });

  describe('Add New Category', () => {
    it("Shoud create new category and return 200 status code with 'Category added successfully' message", async () => {
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/addcategory')
        .set('authorization', `Bearer ${authorization}`)
        .send(categoryBody);

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Category added successfully');
    });
  });

  describe('Post Product Endpoint', () => {
    beforeAll(async () => {
      const res = await request(app).get(
        '/api/v1/ecommerce_portfolio/productcategory'
      );

      categoryID = res.body.results[0]._id;
    });

    it('Should return 201 status code after posted(created) new product', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await request(app)
        .post('/api/v1/ecommerce_portfolio/postproduct')
        .set('authorization', `Bearer ${authorization}`)
        .field('name', 'Iphone 15 pro max')
        .field('description', 'Latest Iphone')
        .field('price', 49.99)
        .field('stock', 100)
        .field('category', `${categoryID}`)
        .field('brand', 'Iphone')
        .field('averageRating', 4.5)
        .field('ratingCount', 100)
        .attach('imageUrl', imagePath)
        .field('sku', 'ABC125')
        .field('weight', 1.5)
        .field('dimensions', '10x5x2')
        .field('isActive', true)
        .field('_csrf', '123');

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Uploaded');
    });
  });

  describe('Add to cart EndPoint', () => {
    beforeAll(async () => {
      const res = await request(app).get(
        `/api/v1/ecommerce_portfolio/products?`
      );

      productID1 = res.body.results[0]._id;
    });

    it('Should return 201 status code when new Item added to cart', async () => {
      const res = await request(app)
        .post(`/api/v1/ecommerce_portfolio/addtocart`)
        .send({ productid: productID1 })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Added to cart');
    });

    it('Should throw forbidden error when invalid(expired) token provided', async () => {
      const res = await request(app)
        .post(`/api/v1/ecommerce_portfolio/addtocart`)
        .send({ productid: productID1 })
        .set('authorization', `Bearer abc123`);

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Forbidden Request');
    });

    it('Should throw Un authenticated error when not token provided', async () => {
      const res = await request(app)
        .post(`/api/v1/ecommerce_portfolio/addtocart`)
        .send({ productid: productID1 });

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('No token Provided');
    });

    it('Should throw bad request error if product Id is not exist', async () => {
      const res = await request(app)
        .post(`/api/v1/ecommerce_portfolio/addtocart`)
        .send({ productid: '665aede8446847bd5644edd0' })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Product Id Not Found');
    });
  });

  describe('Get cart Item Endpoint', () => {
    it('Should return 200 when All Item in the cart Fetched', async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getcart`)
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.result[0]?.userid).toBe(userId);
      expect(res.body.result[0]?.product._id).toBe(productID1);
    });

    it('Should throw 401 Un authorized error is user not logged in', async () => {
      const res = await request(app).get(`/api/v1/ecommerce_portfolio/getcart`);

      expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('No token Provided');
    });

    it('Should throw 403 forbidden error is user not logged in', async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getcart`)
        .set('authorization', `Bearer abc123`);

      expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Forbidden Request');
    });
  });

  describe('Delete Product Locally', () => {
    beforeAll(async () => {
      const res = await request(app).get(
        `/api/v1/ecommerce_portfolio/products?`
      );
      publicID1 = res.body.results[0].publicId;
    });

    it('should return 200 status code when productt Deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteproduct`)
        .send({ publicId: publicID1 })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Deleted');
    });
  });

  describe('Update Cart', () => {
    beforeAll(async () => {
      const res = await request(app)
        .get(`/api/v1/ecommerce_portfolio/getcart`)
        .set('authorization', `Bearer ${authorization}`);

      cartId = res.body.result[0]._id;
    });

    it('Should return 200 status code when a cart updated', async () => {
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatecart`)
        .set('authorization', `Bearer ${authorization}`)
        .send({
          _id: cartId,
          quantity: 11,
        });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Item Updated');
    });

    it('Should throws 400 bad request error when Item not found', async () => {
      const res = await request(app)
        .put(`/api/v1/ecommerce_portfolio/updatecart`)
        .set('authorization', `Bearer ${authorization}`)
        .send({
          _id: '6666fca5f3b9505acfc89e03',
          quantity: 11,
        });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Item not found');
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
