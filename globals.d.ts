export { };

export type JWT_API_DATA = {
    uId: string,
    email: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string
      MONGO_USER: string
      MONGO_PASS: string
      PORT: string
      SALT_ROUNDS: string
      DEV: string
      JWT_SECRET: string
    }
  }
}


declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JWT_API_DATA
  }
}
