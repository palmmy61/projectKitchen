const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
const encrypt = require("mongoose-encryption");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://Pari:1234@pari.wedp9kz.mongodb.net/UserDB?retryWrites=true&w=majority&ssl=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  type: String,
  imageUrl: String
});


const Product = mongoose.model('Product', productSchema);



// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// POST a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, type } = req.body;
    const newProduct = await Product.create({ name, price, type });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//
// PUT (update) an existing product by ID
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a product by ID
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    res.json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// GET home page
app.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const minPrice = req.query.minPrice || 0;
    const maxPriceLimit = 10000;
    const maxPrice = req.query.maxPrice || maxPriceLimit;

    const safeMaxPrice = Math.min(maxPrice, maxPriceLimit);

    const products = await Product.find({
      name: { $regex: new RegExp(searchTerm, 'i') },
      price: { $gte: minPrice, $lte: safeMaxPrice },
    });

    res.render('index', { products, searchTerm, minPrice, maxPrice: safeMaxPrice });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
