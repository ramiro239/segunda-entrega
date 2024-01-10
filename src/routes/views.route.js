const { Router } = require('express');
//const { PManager } = require('../daos/file/ProductManager');
const { ProductMongo } = require('../daos/mongo/products.daomongo.js');
const router = Router();

//const productsMock = new PManager('./src/daos/file/mock/Productos.json');
const productsMongo = new ProductMongo();

router.get('/', async (req, res) => {
  res.redirect('/products');
});

router.get('/products', async (req, res) => { //98

  // handle url API products
  const { page = 1, sort, category, availability } = req.query;
  const apiUrl = new URL('http://localhost:8080/api/products');
  apiUrl.searchParams.set('page', page);
  apiUrl.searchParams.set('limit', '5');
  if (sort) apiUrl.searchParams.set('sort', sort);
  if (category) apiUrl.searchParams.set('category', category);
  if (availability) apiUrl.searchParams.set('availability', availability);

  let resp = await fetch(apiUrl);
  resp = await resp.json();
  //const { data, page, totalPages, hasPrevPage, hasNextPage, prevLink, nextLink } = await resp.json();

  // inform error
  let pageError = false; // page not exist
  let productError = false;
  if (resp.status === 'error') {
    productError = true;
  }

  // update url and security
  const workingUrl = req.url.split('?')[1];
  let arrayString;
  // ---- console.log(!workingUrl, arrayString);
  if (workingUrl) {
    arrayString = workingUrl.split('&');

    let secPage = arrayString.findIndex((elm) => elm.split('=')[0] == 'page');
    if (secPage != -1) {
      secPage = arrayString[secPage].split('=')[1];
      if (secPage > resp.totalPages || secPage < 0) {
        pageError = true;
      }
    }
  }

  // update product
  let product;
  if (!productError) {
    product = await resp.docs;
    product.forEach((prd) => {
      prd.price = new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(
        prd.price,
      );
      prd['unavailability'] = prd.stock == 0;
      prd['link'] = `/products/${prd._id}`;
    });
  }

  function filterUrl(array, filter) {
    if (!array) return '/products?';
    array = array.filter((elm) => ![filter, 'page'].includes(elm.split('=')[0]));
    return `/products?${array.join('&') || ''}`
  }
  const url = filterUrl(arrayString, 'category');

  res.render('products', {
    title: 'Inicio',
    pageError,
    productError,
    product,
    page: resp.page,
    totalPages: resp.totalPages,
    hasPrevPage: resp.hasPrevPage,
    hasNextPage: resp.hasNextPage,
    prevLink: `${filterUrl(arrayString, 'x')}${resp.prevLink}`,
    nextLink: `${filterUrl(arrayString, 'x')}${resp.nextLink}`,
    category: await productsMongo.getCategorys(),
    ascend: `${filterUrl(arrayString, 'sort')}sort=asc`,
    descend: `${filterUrl(arrayString, 'sort')}sort=desc`,
    disorderly: `${filterUrl(arrayString, 'sort')}sort=disorderly`,
    availability: `${filterUrl(arrayString, 'availability')}availability=false`,
    unavailability: `${filterUrl(
      arrayString,
      'availability',
    )}availability=true`,
    url,
  });
});

router.get('/products/:pid', async (req, res) => {
  const objectRender = { title: 'Producto' };
  const pid = req.params.pid;

  let resp = await fetch(`http://localhost:8080/api/products/${pid}`);
  resp = await resp.json();

  const product = resp.data;

  if (resp.status == 'ok') {
    objectRender['productError'] = false;
    objectRender['product'] = product;
    objectRender['cart'] = `6591b1a1419b33fbcb57e2b1`;
  } else {
    objectRender['productError'] = true;
  }
  //console.log(objectRender);
  res.render('product', objectRender);
});

router.get('/cart', async (req, res) => {
  const objectRender = { title: 'Carrito' };
  let resp = await await fetch(
    `http://localhost:8080/api/carts/6591b1a1419b33fbcb57e2b1`,
  );
  resp = await resp.json();
  const cart = resp.data;
  const products = cart.products;
  products.forEach((prd) => {
    prd['total'] = prd.product.price * prd.quantity;
  });

  if (resp.status == 'ok') {
    objectRender['cartError'] = false;
    objectRender['cartId'] = cart._id;

    if (products.length != 0) {
      objectRender['cartNoEmpty'] = true;
      objectRender['products'] = products;
    }
  } else {
    objectRender['cartError'] = true;
  }

  res.render('cart', objectRender);
});

router.get('/realTimeProducts', async (req, res) => {
  let resp = await fetch(`http://localhost:8080/api/products?limit=100`);
  resp = await resp.json();
  const product = resp.docs;

  product.forEach((prd) => {
    prd.price = new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(
      prd.price,
    );
  });
  res.render('realTimeProducts', {
    title: 'Productos en tiempo Real',
    product,
    cssPlus: `https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css`,
  });
});

router.get('/chat', async (req, res) => {
  res.render('chat', {});
});

exports.viewsRouter = router;
