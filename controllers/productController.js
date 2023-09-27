import Products from '../models/productModel.js'
import { v2 as cloudinary } from 'cloudinary';
import got from 'got'
import mongoose from 'mongoose';


export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, size, color } = req.body;

    // Upload images to Cloudinary
    const imageUrls = [];
    const { files } = req;

    if (files && files.length > 0) {
      for (const file of files) {
        // Upload the image to Cloudinary with a resizing transformation
        const result = await cloudinary.uploader.upload(file.path, {
          transformation: [
            { width: 800, height: 600, crop: 'fill' } // Specify the desired width and height
          ]
        });

        imageUrls.push(result.secure_url);
      }
    }

    const products = await Products.create({
      name,
      color,
      price,
      description,
      category,
      size,
      images: imageUrls.map(url => ({ url }))
    });

    res.status(201).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Bad request" });
  }
};



export const getAllProducts = async (req, res) => {
  try {
    const { page, limit, category, ratings } = req.query;
    const query = {};

    const lim = limit || 10;

    if (category) {
      query.category = category;
    }

    if (ratings) {
      query.ratings = Number(ratings);
    }

    console.log(query);

    // Count the total number of products
    const totalCount = await Products.countDocuments(query);

    // Calculate the number of pages
    const totalPages = Math.ceil(totalCount / lim); // Use lim here, not limit

    const products = await Products.find(query)
      .skip((parseInt(page) - 1) * lim)
      .limit(lim);

    if (!products || products.length === 0) {
      return res.status(200).json({
        products,
        page: (page ? +page : 1),
        totalPages,
        totalCount,
      });
    }

    res.status(200).json({
      products,
      page: (page ? +page : 1),
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
export const deleteAllProducts = async (req, res) => {
  try {
    await Products.deleteMany({})
    res.status(200).json({ status: "Success", "message": "All products have been deleted" })
  } catch (error) {
    res.status(500).json({ status: "Products not deleted" })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Products.findByIdAndDelete(productId)

    if (!product) return res.status(404).json({ status: "error", message: "Product not found" })
    res.status(200).json({ status: "success", message: "Product has been deleted" })

  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal server error" })
  }
}

export const upDatePost = async (req, res) => {
  console.log(req.file);
  try {
    const { id: _id } = req.params;
    const post = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send("No post with id")
    if (req.file) {
      var response = await cloudinary.v2.uploader.upload(req.file.path);
      const updatedPost = await postMessages.findByIdAndUpdate(_id, { ...post, _id, image: response.url, }, { new: true })
      return res.status(200).json({ updatedPost })
    } else {
      const updatedPost = await postMessages.findByIdAndUpdate(_id, { ...post, _id }, { new: true })
      res.status(201).json({ updatedPost })
    }

  } catch (error) {
    res.status(500).json({ msg: error })
  }
}

export const updateProduct = async (req, res) => {
  console.log(req.body, req.files);

  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) res.status(404).send("No post with id");

    // Check if the product exists
    const existingProduct = await Products.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ status: "error", msg: "Product not found" });
    }

    // Check if there are new image files to upload
    const { files } = req;
    if (files && files.length > 0) {
      const imageUrls = [];
      for (const file of files) {
        // Upload the image to Cloudinary with resizing if needed
        const result = await cloudinary.uploader.upload(file.path, {
          transformation: [
            { width: 800, height: 600, crop: 'fill' } // Specify the desired width and height
          ]
        });
        imageUrls.push(result.secure_url);
      }
      // Update the product's image URLs with the new ones
      existingProduct.images = imageUrls.map(url => ({ url }));
    }

    // Update the product with the new data and images
    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { $set: { ...req.body, images: existingProduct.images } }, // Update with the request body and existing images
      { new: true }
    );

    res.status(201).json({ status: "success", msg: "Product updated", product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", msg: "Bad request" });
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

export const searchProducts = async (req, res) => {
  const { query, page, limit } = req.query;
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;

  try {
    const regexQuery = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: `^${query}$`, $options: "i" } },
      ],
    };

    // Count the total number of products that match the search criteria
    const totalCount = await Products.countDocuments(regexQuery);

    // Calculate the number of pages
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Perform pagination with skip and limit
    const products = await Products.find(regexQuery)
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    if (!products || products.length === 0) {
      return res.status(200).json({
        products,
        currentPage: 0,
        totalPages: 0,
        totalCount: 0,
      });
    }

    res.status(200).json({
      products,
      currentPage,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPaymentLink = async (req, res) => {
  console.log(req.body);
  const {name, phonenumber, email, price} = req.body
  try {
    const response = await got.post("https://api.flutterwave.com/v3/payments", {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
      },
      json: {
        tx_ref: Date.now() + Math.floor(Math.random() * 1000),
        amount: price,
        currency: "NGN",
        redirect_url: "http://localhost:3000/payment-success",
        meta: {
          consumer_id: 11,
          consumer_mac: "92a3-912ba-1192a"
        },
        customer: {
          email: email,
          phonenumber: phonenumber,
          name: name
        },
        customizations: {
          title: "Adesiyan Payments",
          logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
        }
      }
    }).json();
    res.status(200).json(response)
  } catch (err) {
    console.log(err.code);
    console.log(err.response.body);
    res.status(400).json({ err })
  }
}



