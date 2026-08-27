import express from 'express';
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getBanners,
  verifyCoupon,
  submitReview
} from '../controllers/productController.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.get('/categories', getCategories);
router.get('/banners', getBanners);
router.post('/coupons/verify', verifyCoupon);
router.post('/reviews', submitReview);

export default router;
