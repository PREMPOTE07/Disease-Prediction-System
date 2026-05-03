import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 🔥 Get token from headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;