import express from 'express';
import nodemon from 'nodemon';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import productRouter from './routes/productRouter.js';
import { v2 as cloudinary } from 'cloudinary';
import userRouter from './routes/user.js';
import auth from './middlewares/auth.js';
import cors from 'cors';


const app = express();
dotenv.config();

// Use the cors middleware
app.use(cors());

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true}))

// NOT FOUND MIDDLEWARE
// app.use('*', (req, res) => {
//   res.status(404).json({ msg: 'not found' })
// });
  
app.use("/api/v1/products", productRouter) // add auth
app.use("/api/v1/users", userRouter);

cloudinary.config({
  cloud_name: "df04essjr",
  api_key: 628391574854572,
  api_secret: "XlB54R74QtmzOIfXafo9wlFUbbw"
});

const port = process.env.PORT || 5100;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  })
} catch (error) {
  console.log(error);
  process.exit(1)
}