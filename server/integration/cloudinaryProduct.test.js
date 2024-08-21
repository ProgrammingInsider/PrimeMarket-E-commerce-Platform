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
  let productID2;
  let publicID1;
  let publicID2;

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

  let product = {
    name: 'Iphone 15 pro max',
    description: 'Latest Iphone',
    price: 49.99,
    stock: 100,
    brand: 'Iphone',
    weight: 1.5,
    dimensions: '10x5x2',
    isActive: true,
    _csrf: '123',
  };

  let updateProduct = {
    name: 'Vivo 20 pro max',
    description: 'Latest Vivo',
    price: 1099.99,
    stock: 141,
    brand: 'Vivo',
    weight: 2,
    dimensions: '10x5x2',
    isActive: true,
  };
  // _id:667133ca2a9f18f4a6d777f2
  // oldPublicId:1718696156459amo.JPG

  let formdataRequest = async (product) => {
    const res = await request(app)
      .post('/api/v1/ecommerce_portfolio/postproducttocloudinary')
      .set('authorization', `Bearer ${authorization}`)
      .field('name', product.name)
      .field('description', product.description)
      .field('price', product.price)
      .field('stock', product.stock)
      .field('category', product.category)
      .field('brand', product.brand)
      .attach('imageUrl', product.imageUrl)
      .field('sku', product.sku)
      .field('weight', product.weight)
      .field('dimensions', product.dimensions)
      .field('isActive', true);

    return res;
  };

  let updateFormdataRequest = async (updateProduct, updatePath) => {
    const res = await request(app)
      .put(`/api/v1/ecommerce_portfolio/updateproductfromcloudinary`)
      .set('authorization', `Bearer ${authorization}`)
      .field('name', updateProduct.name)
      .field('description', updateProduct.description)
      .field('price', updateProduct.price)
      .field('stock', updateProduct.stock)
      .field('category', updateProduct.category)
      .field('brand', updateProduct.brand)
      .attach('imageUrl', updateProduct.imageUrl)
      .field('sku', updateProduct.sku)
      .field('weight', updateProduct.weight)
      .field('dimensions', updateProduct.dimensions)
      .field('isActive', true)
      .field('_id', updateProduct._id)
      .field('oldPublicId', updateProduct.oldPublicId);

    return res;
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

  describe('Fetch All Endpoint', () => {
    it('Fetch all categories', async () => {
      const res = await request(app).get(
        '/api/v1/ecommerce_portfolio/productcategory'
      );

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.results).not.toBeNull();
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
      const res = await formdataRequest({
        sku: 'ABC125',
        category: categoryID,
        imageUrl: imagePath,
        ...product,
      });

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Uploaded');
    });

    it('Should throw bad request error when SKU value is duplicate', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await formdataRequest({
        sku: 'ABC125',
        category: categoryID,
        imageUrl: imagePath,
        ...product,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Sku is taken');
    });

    it('Should create new product still when SKU and isActive value is not specified by the user', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/programming.png');
      const res = await formdataRequest({
        ...product,
        name: 'Samsung',
        sku: '',
        category: categoryID,
        imageUrl: imagePath,
      });

      expect(res.statusCode).toBe(StatusCodes.CREATED);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Uploaded');
    });

    it('Should throw 400 bad request status code when no product image uploaded', async () => {
      const res = await formdataRequest({
        sku: '',
        category: categoryID,
        imageUrl: null,
        ...product,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('No files were uploaded.');
    });

    it('Should throw 400 bad request status code when file type is invalid', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/Home.pdf');
      const res = await formdataRequest({
        sku: '',
        category: categoryID,
        imageUrl: imagePath,
        ...product,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Invalid File Extension');
    });

    it('Should throw 400 bad request status code when no file size exceed the limit', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/large.jpg');
      const res = await formdataRequest({
        sku: '',
        category: categoryID,
        imageUrl: imagePath,
        ...product,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe(
        'File size exceeds the limit. It should be 5MB maximum.'
      );
    });

    it('Should throw 400 bad request status code when category is invalid', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/large.jpg');
      const res = await formdataRequest({
        sku: '',
        category: '665dfd58d24f3d704ac7d159',
        imageUrl: imagePath,
        ...product,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Category Not Found');
    });
  });

  // Update and Delete Product Cloudinary
  describe('Update Product From Cloudinary', () => {
    beforeAll(async () => {
      const res = await request(app).get(
        `/api/v1/ecommerce_portfolio/products?`
      );

      productID1 = res.body.results[0]._id;
      productID2 = res.body.results[1]._id;
      publicID1 = res.body.results[0].publicId;
      publicID2 = res.body.results[1].publicId;
    });
    it('should return 200 status code when product updated', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/portfolio.jpg');
      const res = await updateFormdataRequest({
        ...updateProduct,
        imageUrl: imagePath,
        sku: '',
        category: categoryID,
        _id: productID1,
        oldPublicId: publicID1,
      });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Information Updated');
    });

    it('should return 200 status code when new image is not uploaded', async () => {
      const res = await updateFormdataRequest({
        ...updateProduct,
        imageUrl: '',
        sku: '',
        category: categoryID,
        _id: productID1,
        oldPublicId: publicID1,
      });

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Information Updated');
    });

    it('should throw 400 bad request status code when old public Id invalid', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/portfolio.jpg');
      const res = await updateFormdataRequest({
        ...updateProduct,
        imageUrl: imagePath,
        sku: '',
        category: categoryID,
        _id: productID1,
        oldPublicId: 'abc.jpg',
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Product Not Found');
    });

    it('should throw 400 bad request status code when old public Id is invalid', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/portfolio.jpg');
      const res = await updateFormdataRequest({
        ...updateProduct,
        imageUrl: imagePath,
        sku: '',
        category: categoryID,
        _id: productID1,
        oldPublicId: publicID2,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Product Not Found');
    });

    it('should throw 400 bad request status code when SKU is already taken', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/portfolio.jpg');
      const res = await updateFormdataRequest({
        ...updateProduct,
        imageUrl: imagePath,
        sku: 'ABC125',
        category: categoryID,
        _id: productID1,
        oldPublicId: publicID1,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Sku is taken');
    });

    it('should throw 400 bad request status code when category Id is invalid', async () => {
      const imagePath = path.resolve(__dirname, '../testImage/portfolio.jpg');
      const res = await updateFormdataRequest({
        ...updateProduct,
        imageUrl: imagePath,
        sku: 'ABC125',
        category: '666c2f5b16d36a7b4b5dbf26',
        _id: productID1,
        oldPublicId: publicID1,
      });

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe('Category Not Found');
    });
  });

  describe('Delete Product From Cloudinary', () => {
    beforeAll(async () => {
      const res = await request(app).get(
        `/api/v1/ecommerce_portfolio/products?`
      );
      publicID1 = res.body.results[0].publicId;
      publicID2 = res.body.results[1].publicId;
    });

    it('should return 200 status code when productt Deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteproductfromcloudinary`)
        .send({ publicId: publicID1 })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Deleted');
    });

    it('should return 200 status code when product Deleted', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteproductfromcloudinary`)
        .send({ publicId: publicID2 })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.OK);
      expect(res.body.status).toBeTruthy();
      expect(res.body.message).toBe('Product Deleted');
    });

    it('should throw 400 bad request error when publicId is invalid', async () => {
      const res = await request(app)
        .delete(`/api/v1/ecommerce_portfolio/deleteproductfromcloudinary`)
        .send({ publicId: '123.jpg' })
        .set('authorization', `Bearer ${authorization}`);

      expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.status).toBeFalsy();
      expect(res.body.message).toBe(
        'Product Image Not Deleted from Cloudinary, please try again'
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
