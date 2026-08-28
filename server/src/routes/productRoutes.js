import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getBanners,
  verifyCoupon,
  submitReview
} from '../controllers/productController.js';
import { upload, handleMultipleUpload } from '../controllers/uploadController.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.get('/categories', getCategories);
router.get('/banners', getBanners);
router.post('/coupons/verify', verifyCoupon);
router.post('/reviews/upload', upload.array('images', 4), handleMultipleUpload);
router.post('/reviews', submitReview);

export default router;
