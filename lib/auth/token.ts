// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// const JWT_EXPIRES_IN = "24h";

// interface TokenPayload {
//   userId: number;
//   email?: string;
//   role?: number;
// }

// export const generateToken = (payload: TokenPayload): string => {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// };

// export const verifyToken = (token: string): TokenPayload => {
//   try {
//     return jwt.verify(token, JWT_SECRET) as TokenPayload;
//   } catch (error) {
//     throw new Error("Invalid token");
//   }
// };
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const key = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(key);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
