import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type as T } from '@sinclair/typebox'
import * as statsController from '../../../controllers/statsControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/',getSearch, async function (request, reply) {
    var {orgId} = request.query
    var {uId} = request.user
    var data = await statsController.stat({ uId,orgId })
    reply.code(data.code).send(data.data);
  })
}

/**
 * Fastify Schemas
 */


const getSearch = {
  schema:{
    querystring: T.Object({
      orgId: T.String(),
    })
  }
}


export default protectedRoute;
