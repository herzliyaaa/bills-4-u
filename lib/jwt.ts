import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: "4h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, TOKEN_SECRET);
}
