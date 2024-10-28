import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { connect } from 'mongoose';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors'
// import multer from 'fastify-multer'

// @ts-ignore
import fastifyMongoDbSanitizer from 'fastify-mongodb-sanitizer'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const fastifyMongodbsanitizerOptions = {
  params: true,
  query: true,
  body: true,
};


const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  // TODO: Remove this after the domain gets the certificate
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

  // Place here your custom code!
  connect(process.env.MONGO_URI,{
    dbName: "GO_GREEN"
  }).then(()=>{
      console.log("DB Connected")
    }).catch((err) => {
      console.log(err)
      console.log("Can't connect to DB")
      process.exit(0)
    })
  // mongoose.set("sanitizeFilter",true)

  fastify.register(fastifyMongoDbSanitizer,fastifyMongodbsanitizerOptions)
  // fastify.register(multer.contentParser)

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application

  fastify.register(cors, {
    // origin: "http://10.10.30.204:4444",
    origin: true,
    // credentials: true
  });
  
  
  // JWT OPTS
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // void fastify.register(AutoLoad, {
  //   dir: join(__dirname, 'routes'),
  //   options: opts
  // })

  // PUBLIC ROUTES
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes/public'),
    options: {
      prefix: "/api/v1/public"
    },
  })

  // PROTECTED ROUTES
  fastify.register((instance, { }, next) => {
    instance.addHook("onRequest", async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        reply.send(err)
      }
    })
    instance.register(AutoLoad, {
      dir: join(__dirname, 'routes/protected'),
      options: {
        prefix: "/api/v1/auth"
      },
    })
    next()
  }, {})

  fastify.register((instance, { }, next) => {
    instance.addHook("onRequest", async (request, reply) => {
      try {
        var data = await request.jwtVerify() as Record<string,string>
        if(data.role !== "admin") return reply.unauthorized()
      } catch (err) {
        reply.send(err)
      }
    })
    instance.register(AutoLoad, {
      dir: join(__dirname, 'routes/admin'),
      options: {
        prefix: "/api/v1/admin"
      },
    })
    next()
  }, {})

};

export default app;
export { app, options }
