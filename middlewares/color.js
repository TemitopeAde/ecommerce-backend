export function validateProductInputs(req, res, next) {
  const allowedColors = ["red", "blue", "green", "yellow", "black", "white", "other"];
  const allowedSizes = ["xs", "s", "m", "l", "xl", "xxl"];
  const allowedCategories = ["male", "female", "unisex"];

  const userColor = req.body.color;
  const userSize = req.body.size;
  const userCategory = req.body.category;
  const productName = req.body.name;
  const description = req.body.description;
  const price = req.body.price;

  const errors = [];

  if (!productName || typeof productName !== "string" || productName.trim().length === 0) {
    errors.push("Invalid product name. Please enter a valid product name.");
  }

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    errors.push("Invalid product description. Please enter a valid description.");
  }

  if (isNaN(price) || price <= 0) {
    errors.push("Invalid product price. Please enter a valid price.");
  }

  if (!allowedColors.includes(userColor)) {
    errors.push("Invalid color. Please select a valid color.");
  }

  if (!allowedSizes.includes(userSize)) {
    errors.push("Invalid size. Please select a valid size.");
  }

  if (!allowedCategories.includes(userCategory)) {
    errors.push("Invalid category. Please select a valid category.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
