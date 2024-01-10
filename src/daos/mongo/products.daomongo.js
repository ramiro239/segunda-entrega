//const { ObjectId } = require('bson');
const { validateFields } = require('../../helpers/functions.js');
const { productModel } = require('./models/products.model.js');
const { CustomError } = require('../../helpers/handleErrrors.js');

class ProductDaoMongo {
  constructor() {
    this.model = productModel;
  }

  getProducts = async (filters) => {
    try {
      const query = filters.query || {};
      const options = {
        limit: Number(filters.limit),
        page: Number(filters.page),
      };

      if (filters.category) {
        const categories = await this.getCategorys();
        if (
          Array.isArray(categories) &&
          categories.includes(filters.category)
        ) {
          query.category = filters.category;
        }
      }

      if (filters.availability) {
        query.stock = { $gt: 0 };
      }

      const sortOptions = {
        '1': 1,
        '-1': -1,
        asc: 'asc',
        desc: 'desc',
      };
      const validateSort = sortOptions[filters.sort];
      if (validateSort) options.sort = validateSort;

      return await this.model.paginate(query, options);
    } catch (error) {
      return 'Hubo un error en la petición';
    }
  };

  getProductsById = async (pid) => {
    try {
      const product = await this.model.findById({ _id: pid }).lean();

      if (!product) {
        return 'Producto no encontrado';
      }
      return product;
    } catch (error) {
      return 'Ha ocurrido un error al buscar el producto';
    }
  };

  addProduct = async (fields) => {
    const requiredFields = [
      'title',
      'description',
      'code',
      'price',
      'stock',
      'status',
      'category',
      'thumbnail',
    ];
    try {
      const newProduct = validateFields(fields, requiredFields);
      if (typeof newProduct === 'string') {
        return newProduct;
      }

      return await this.model.create(newProduct);
    } catch (error) {
      if (error instanceof CustomError) {
        error.addContext('addProduct');
        throw error; 
      } else if (error.code === 11000) {
        // Si es un error de código duplicado en MongoDB
        throw new CustomError(`ERROR: Código repetido`, 400, 'addProduct');
      } else {
        // Para otros errores no controlados
        throw new CustomError(`Verificar ERROR de mongoose código: ${error.code}`, 400, 'addProduct');
      }
    }
  };

  updateProduct = async (pid, changedProduct) => {
    const updateProd = await this.getProductsById(pid);

    if (updateProd.length === 0) {
      return 'Producto no encontrado';
    }

    try {
      await this.model.updateOne({ _id: pid }, changedProduct);
      return await this.getProductsById(pid);
    } catch (error) {
      if (error.code === 11000) {
        return 'ERROR: esta queriendo ingresar un codigo repetido';
      }
      return 'ERROR: se ha producido une error al modificar el producto';
    }
  };

  deleteProductById = async (pid) => {
    const deleteProd = await this.getProductsById(pid);

    if (deleteProd.length === 0) {
      return 'Producto no encontrado';
    }
    try {
      await this.model.deleteOne({ _id: pid });
      return deleteProd;
    } catch (error) {
      return 'Hubo un error en la peticion';
    }
  };

  deleteProductByCode = async (pcode) => {
    const productoEliminado = await this.model.find({ code: pcode });

    if (productoEliminado.length === 0) {
      return 'Producto no encontrado';
    }
    try {
      await this.model.deleteOne({ code: pcode });
      return productoEliminado;
    } catch (error) {
      return 'Hubo un error en el la peticion';
    }
  };

  getCategorys = async () => {
    try {
      const categories = await this.model.aggregate([
        { $group: { _id: '$category' } },
        { $sort: { _id: 1 } },
      ]);
      return categories.map((x) => {
        return x._id;
      });
    } catch (error) {
      return 'Ocurrio un Error';
    }
  };
}

exports.ProductMongo = ProductDaoMongo;
