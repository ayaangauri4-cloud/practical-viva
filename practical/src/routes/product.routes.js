const express = require('express');

const productController = require('../controllers/product.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createProductSchema,
  updateProductSchema
} = require('../validators/product.validator');

const router = express.Router();

router.get('/', productController.getProducts);
router.post('/', protect, requireRole('admin'), validate(createProductSchema), productController.createProduct);
router.put('/:id', protect, requireRole('admin'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', protect, requireRole('admin'), productController.deleteProduct);

module.exports = router;
