require('dotenv').config();
const mongoose = require('mongoose')

exports.connectDB = async () => {
  await mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@gustsirt.jaw8omb.mongodb.net/ecommerce?retryWrites=true&w=majority`)
  console.log('Base de datos conectada')
};