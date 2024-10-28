import {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
// import {Type as T} from '@sinclair/typebox'
import * as usersController from '../../../controllers/userControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    var {uId} = request.user
    var data = await usersController.profile({uId})
    reply.code(data.code).send(data.data);
  })
}

/**
 * Fastify Schemas
 */
// const imageUpdateSchema = {
//   schema:{
//       params: T.Object({
//           uId: T.String()
//       })
//   }
// }

// const profileUpdateSchema = {
//     schema:{
//         body :  T.Object({
//           email: T.Optional(T.String()),
//           firstName: T.Optional(T.String()),
//           lastName: T.Optional(T.String()),
//           phoneNum: T.Optional(T.String()),
//           photo: T.Optional(T.String())
//       }),
//     },
//   }


export default protectedRoute;
