import { Router } from "express";
import { createPaymentLink, 
  createProduct, deleteAllProducts, 
  deleteProduct, getAllProducts, 
  getProduct, searchProducts, updateProduct } 
from "../controllers/productController.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { validateProductInputs} from "../middlewares/color.js";

const productRouter = Router();

productRouter.get("/", getAllProducts)
productRouter.post("/", upload.array('images', 5), validateProductInputs ,createProduct)
productRouter.delete("/", deleteAllProducts)
productRouter.get("/search", searchProducts)
productRouter.delete("/:productId", deleteProduct)
productRouter.get("/:productId",  getProduct)
productRouter.patch("/:productId", upload.array('images', 5), updateProduct)
productRouter.post("/payment-link", createPaymentLink)


export default productRouter;