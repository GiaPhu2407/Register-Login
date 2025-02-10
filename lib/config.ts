if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  export const config = {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    }
  } as const;