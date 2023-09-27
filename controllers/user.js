import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import user from '../models/userModel.js';


export const signin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
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