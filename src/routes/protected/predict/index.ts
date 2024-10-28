// import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
// import * as predictController from '../../../controllers/predictControllers.js'
// import multer from 'fastify-multer'

// const upload = multer({ storage: multer.memoryStorage() });

// const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
//   fastify.post('/',{preHandler: upload.single('image')}, async function (request, reply) {
//     var {uId} = request.user
//     // @ts-ignore
//     var data = await predictController.predict({ uId,file: request.file })
//     reply.code(data.code).send(data.data);
//   })

// }

// /**
//  * Fastify Schemas
//  */


// export default protectedRoute;
