import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import user from '../models/userModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { log } from 'console';

// import * as Stripe from 'stripe';
const stripe = new Stripe('sk_test_qXbPhV8fGIj4juj8EqGUdpnr00mm7DwYIt');


export const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  const existingUser = await user.findOne({ email })
  if (!existingUser) return res.status(404).json({ message: "User doesn't exist" })
  const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)

  if (!isPasswordCorrect) return res.status(404).json({ message: "Invalid credentials" })
  const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'test', { expiresIn: "1h" })

  res.status(200).json({ result: existingUser, token })

}

export const signup = async (req, res) => {
  const { email, password, confirmPassword, name } = req.body;
  console.log(req.body);

  const existingUser = await user.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists." })
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" })
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const result = await user.create({ email, password: hashedPassword, name: name })
  if (!result) return res.status(400).json({ message: "User not created" })
  const token = jwt.sign({ email: result.email, id: result._id }, "test", { expiresIn: "1h" })
  res.status(200).json({ token, result })
}


export const resetPasswordController = async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.params;

  try {
    // Find the user with the provided token and check if it's not expired
    const updatedUser = await user.findOneAndUpdate(
      {
        resetPasswordToken: token,
        resetTokenExpire: { $gt: Date.now() },
      },
      { $set: { password: await bcrypt.hash(newPassword, 10) } }, // Hash the new password
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: 'Insvalid user or expired token' });
    }

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset failed' });
  }
}


export const forgetPasswordController = async (req, res) => {

  const { email } = req.body;

  try {
    // Generate a unique token and set expiration time (e.g., 1 hour)
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hour

    // Find the user by email
    const foundUser = await user.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's resetToken and resetTokenExpires in the database
    foundUser.resetPasswordToken = token;
    foundUser.resetTokenExpire = tokenExpiration;
    await foundUser.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        pass: 'vkpi aztq xuef kclg',
      },
    });

    // Send a password reset email with the token
    const mailOptions = {
      from: '',
      to: email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Password reset email sent to ${email}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email' });
  }
}




export const stripePayment = async (req, res) => {

  try {
    const { cartItems } = req.body;

    const line_items = cartItems?.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.list_price * 100),
        },
        quantity: item.quantity,
      }
    })


    // console.log(cartItems);
    const session = await stripe.checkout.sessions.create({
      line_items,
      phone_number_collection: {
        enabled: true
      },
      mode: 'payment',
      success_url: 'https://willowy-donut-92f009.netlify.app/payment-success',
      cancel_url: 'https://willowy-donut-92f009.netlify.app/payment-failed',
    });

    res.status(200).json({ url: session.url })
  } catch (error) {
    res.status(400).json({ "message": "Bad request", error: error })
  }
}

export const stripeWebHooks = async (req, res) => {
  console.log(req.headers);
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const endpointSecret = "whsec_50b9a16d6ade42be34c86486b175e9b9d0ff3caf5c822738c211b820396566e8";

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    res.status(200).json({ event })
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  console.log(`Unhandled event type ${event.type}`);

  // Return a 200 response to acknowledge receipt of the event
  res.send();
}