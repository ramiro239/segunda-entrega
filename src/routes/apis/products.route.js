const { Router } = require('express');
const { ProductMongo } = require('../../daos/mongo/products.daomongo');
const { CustomError } = require('../../helpers/handleErrrors.js');

const router = Router();
const products = new ProductMongo();

// GET http://localhost:PORT/api/products + ? limit, page, sort, query
router.get('/', async (req, res) => {
  let {
    limit = 10,
    page = 1,
    category,
    availability = true,
    sort,
    campo1,
    filtro1,
    campo2,
    filtro2,
    campo3,
    filtro3,
  } = req.query;

  const filters = {
    limit,
    page,
    query: {},
  };

  availability = availability == true || availability == 'true';
  if (category) {
    filters.category = category;
  }
  if (availability) {
    filters.availability = availability;
  }
  if (sort) {
    filters.sort = sort;
  }
  if (campo1 && filtro1) {
    filters.query[campo1] = filtro1;
  }
  if (campo2 && filtro2) {
    filters.query[campo2] = filtro2;
  }
  if (campo3 && filtro3) {
    filters.query[campo3] = filtro3;
  }

  const resp = await products.getProducts(filters);

  const { prevPage, nextPage } = resp;
  const prevLink = prevPage ? `?page=${prevPage}` : '';
  const nextLink = nextPage ? `?page=${nextPage}` : '';

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'error',
      data: resp,
    });
  } else {
    res.status(200).json({
      status: 'success',
      ...resp,
      prevLink: prevLink,
      nextLink: nextLink,
    });
  }
});

// GET http://localhost:PORT/api/products/:pid
router.get('/:pid', async (req, res) => {
  const { pid } = req.params;

  const getProducts = await products.getProductsById(pid);

  if (typeof getProducts === 'string') {
    res.status(404).json({
      status: 'error',
      data: getProducts,
    });
  } else {
    res.status(200).json({
      status: 'ok',
      data: getProducts,
    });
  }
});

// POST http://localhost:PORT/api/products/ + body: whole product
router.post('/', async (req, res) => {
  const newProduct = req.body;

  try {
    const resp = await products.addProduct(newProduct);
    res.status(200).json({
      status: 'ok',
      data: resp,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      // Aquí puedes acceder al contexto y mostrarlo al usuario
      const context = error.getContext();
      res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.getMessage(),
      });
    } else {
      // Para otros errores no controlados
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
      });
    }
  }
});

// PUT http://localhost:PORT/api/products/:pid + body: whole product
router.put('/:pid', async (req, res) => {
  const pid = req.params.pid;
  const changedProduct = req.body;

  const resp = await products.updateProduct(pid, changedProduct);

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'error',
      data: resp,
    });
  } else {
    res.status(200).json({
      status: 'ok',
      data: resp,
    });
  }
});

// DELETE http://localhost:PORT/api/products/:pid
router.delete('/:pid', async (req, res) => {
  const pid = req.params.pid;

  const resp = await products.deleteProductById(pid);

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'error',
      data: resp,
    });
  } else {
    res.status(200).json({
      status: 'ok',
      data: resp,
    });
  }
});

// DELETE http://localhost:PORT/api/products?code=x
router.delete('/', async (req, res) => {
  const pcode = req.query.code;

  const resp = await products.deleteProductByCode(pcode);

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'error',
      data: resp,
    });
  } else {
    res.status(200).json({
      status: 'ok',
      data: resp,
    });
  }
});

// GET http://localhost:PORT/api/products/group/categorys
router.get('/group/categorys', async (req, res) => {
  const resp = await products.getCategorys();

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'error',
      data: resp,
    });
  } else {
    res.status(200).json({
      status: 'ok',
      data: resp,
    });
  }
});

router.get('/group/pruebas/:valor', async (req, res) => {
  const { valor } = req.params;

  const sortOptions = {
    '1': 1,
    '-1': -1,
    asc: 'asc',
    desc: 'desc',
  };

  const resp = sortOptions[valor];
  console.log(resp);
  res.json({
    status: 'ok',
    data: resp,
  });
});

exports.productsRouter = router;
