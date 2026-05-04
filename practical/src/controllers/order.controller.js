const Order = require('../models/order.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError');

const calculateOrderTotalFromItems = async (items) => {
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items.reduce((sum, item) => {
    const product = productMap.get(item.productId.toString());

    if (!product) {
      throw new ApiError(404, `Product not found: ${item.productId}`);
    }

    return sum + product.price * item.quantity;
  }, 0);
};

const normalizeOrderItems = (items) => {
  const itemMap = new Map();

  for (const item of items) {
    const productId = item.productId.toString();
    const currentQuantity = itemMap.get(productId) || 0;
    itemMap.set(productId, currentQuantity + item.quantity);
  }

  return Array.from(itemMap, ([productId, quantity]) => ({ productId, quantity }));
};

const calculateTotal = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return calculateOrderTotalFromItems(order.products);
};

const placeOrder = async (req, res, next) => {
  const decrementedItems = [];

  try {
    const requestedItems = normalizeOrderItems(req.body.products);
    const productIds = requestedItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const item of requestedItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new ApiError(404, `Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `${product.name} is out of stock. Available: ${product.stock}`);
      }
    }

    const totalAmount = requestedItems.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + product.price * item.quantity;
    }, 0);

    for (const item of requestedItems) {
      const result = await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount !== 1) {
        throw new ApiError(409, 'Stock changed while placing order. Please retry.');
      }

      decrementedItems.push(item);
    }

    const createdOrder = await Order.create({
      userId: req.user.id,
      products: requestedItems,
      totalAmount,
      status: 'pending'
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    await Promise.all(
      decrementedItems.map((item) =>
        Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } }
        )
      )
    );

    next(error);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('products.productId', 'name price category')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getCalculatedTotal = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });

    if (!order && req.user.role !== 'admin') {
      throw new ApiError(404, 'Order not found');
    }

    const totalAmount = await calculateTotal(req.params.id);
    res.json({ orderId: req.params.id, totalAmount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getCalculatedTotal,
  calculateTotal
};
