const express = require('express');

const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { placeOrderSchema } = require('../validators/order.validator');

const router = express.Router();

router.use(protect);
router.post('/', validate(placeOrderSchema), orderController.placeOrder);
router.get('/mine', orderController.getUserOrders);
router.get('/:id/total', orderController.getCalculatedTotal);

module.exports = router;
