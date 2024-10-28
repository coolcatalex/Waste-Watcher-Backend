import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
// import { Type as T } from '@sinclair/typebox'
import * as questionsController from '../../../controllers/questionsControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    var {uId} = request.user
    var data = await questionsController.getQuestions({ uId })
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



export default protectedRoute;
