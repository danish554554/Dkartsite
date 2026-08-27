import express from 'express';
import {
  getAnalytics,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  updateInventory,
  getCustomers,
  getAdminBanners,
  createBanner,
  deleteBanner,
  createCategory,
  deleteCategory,
  getAdminCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/adminController.js';
import { upload, handleUpload, handleMultipleUpload } from '../controllers/uploadController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply requireAdmin to all admin endpoints
router.use(requireAdmin);

// Analytics
router.get('/analytics', getAnalytics);

// Product Management
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Order Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Inventory Management
router.get('/inventory', getInventory);
router.patch('/inventory/:id', updateInventory);

// Customers
router.get('/customers', getCustomers);

// Banners
router.get('/banners', getAdminBanners);
router.post('/banners', createBanner);
router.delete('/banners/:id', deleteBanner);

// Categories
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Single & Multiple Image Uploads
router.post('/upload', upload.single('image'), handleUpload);
router.post('/upload-multiple', upload.array('images', 10), handleMultipleUpload);

export default router;
