import express from 'express';
import { signup, signin, forgetPasswordController, resetPasswordController, stripePayment, stripeWebHooks } from '../controllers/user.js';

const userRouter = express.Router();

userRouter.post('/signin', signin);
userRouter.post("/forget-password", forgetPasswordController);
userRouter.post("/reset-password/:token", resetPasswordController);
userRouter.post("/signup", signup);
userRouter.post("/checkout", stripePayment);
userRouter.post("/stripe-webhook", stripeWebHooks)


export default userRouter;