const { Router } = require('express')
const { viewsRouter } = require('./views.route.js');
const { productsRouter } = require('./apis/products.route.js');
const { cartsRouter } = require('./apis/cart.route.js');
const { sessionRouter } = require('./apis/sessions.route.js');
const { messagesRouter } = require('./apis/messages.route.js');

const router = Router()

// definiendo vistas
router.use('/', viewsRouter);

// definiendo la API
router.use('/api/products/', productsRouter);
router.use('/api/carts/', cartsRouter);
router.use('/api/sessions/', sessionRouter);
router.delete('/api/messages', messagesRouter);

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error de server');
});

module.exports = router