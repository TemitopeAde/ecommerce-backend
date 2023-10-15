import { Router } from "express";
import {
  getAllProducts,
  getProduct,
}
  from "../controllers/productController.js";
import auth from "../middlewares/auth.js";


const productRouter = Router();

productRouter.get("/", getAllProducts)
productRouter.get("/:productId", getProduct)


export default productRouter;