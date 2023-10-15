import Products from '../models/productModel.js'
import axios from 'axios';



export const getAllProducts = async (req, res) => {
  try {
    const response = await axios.get('https://api.wps-inc.com/items', {
      headers: {
        Authorization: process.env.BEARER_TOKEN,
      },
    });

    res.status(200).json({ data: response.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};


export const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Products.findById(productId)
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found.' });
    res.status(200).json({ product })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Bad requests' });
  }
}






