import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'Unauthorized', message: 'No bearer token' });
  }

  try {
    const decodedData = jwt.verify(token, 'test');
    req.userId = decodedData?.id;
    next();
  } catch (error) {
    // console.error('Token error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'Unauthorized', message: 'Token has expired' });
    }

    return res.status(401).json({ status: 'Unauthorized', message: 'Invalid token' });
  }
};

export default auth;
