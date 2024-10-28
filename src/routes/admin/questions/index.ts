import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type as T } from '@sinclair/typebox'
import * as questionsController from '../../../controllers/questionsControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.post('/', questionsSchema, async function (request, reply) {
    var questions = request.body
    var { uId } = request.user
    var data = await questionsController.updateQuestions({ questions, uId })
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

const questionsSchema = {
  schema: {
    body: T.Array(
      T.Object({
        category:T.String(),
        question: T.String(),
        options: T.Array(
          T.Object({
            option: T.String(),
            score: T.Number(),
          })
        ),
        maxScore: T.Number(),
        weightage: T.Number()
      })
    ),
  },
}


export default protectedRoute;
