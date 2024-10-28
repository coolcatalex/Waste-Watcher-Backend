import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type as T } from '@sinclair/typebox'
import * as awarenessController from '../../../controllers/awarenessControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.post('/',awarenessSchema, async function (request, reply) {
    var session = request.body
    var {uId} = request.user
    var data = await awarenessController.add({ uId,session })
    reply.code(data.code).send(data.data);
  })

  fastify.get('/stats',awarenessStatsSchema, async function (request, reply) {
    var {orgId} = request.query
    var {uId} = request.user
    var data = await awarenessController.stat({ uId,orgId })
    reply.code(data.code).send(data.data);
  })

  fastify.delete('/',deleteAwarenessSchema, async function (request, reply) {
    var {awarenessId,orgId} = request.query
    var {uId} = request.user
    var data = await awarenessController.deleteAwareness({ uId, awarenessId,orgId})
    reply.code(data.code).send(data.data);
  })

  fastify.get('/search',getSearch, async function (request, reply) {
    var searchData = request.query
    var {uId} = request.user
    var data = await awarenessController.search({ ...searchData, uId})
    reply.code(data.code).send(data.data);
  })
}

/**
 * Fastify Schemas
 */


const getSearch = {
  schema:{
    querystring: T.Object({
      // search: T.Optional(T.String()),
      page: T.Number({
        default: 1
      }),
      count:T.Number({
        default: 30
      }),
      sort:T.String({
        default: "timestamp"
      }),
      direction:T.Union([T.Literal(1),T.Literal(-1)],{
        default: -1
      }),
      orgId:T.Optional(T.String()),
      startDate:T.Optional(T.Number()),
      endDate:T.Optional(T.Number()),
      createdAtstartDate:T.Optional(T.Number()),
      createdAtendDate:T.Optional(T.Number()),
      area:T.Optional(T.Union([T.Literal('classroom'), T.Literal('cafeteria'), T.Literal('office')])),
      classroom:T.Optional(T.Union([
        T.Literal('KG'),
        T.Literal('1'), T.Literal('2'), T.Literal('3'), T.Literal('4'), T.Literal('5'),
        T.Literal('6'), T.Literal('7'), T.Literal('8'), T.Literal('9'), T.Literal('10'),
        T.Literal('11'), T.Literal('12')
      ])),
      classType: T.Optional(T.Union([
        T.Literal("primary"),
        T.Literal("secondary"),
        T.Literal("highschool")
      ])),
    })
  }
}

const awarenessStatsSchema = {
  schema:{
    querystring: T.Object({
      
      orgId:T.String(),
      
    })
  }
}

const deleteAwarenessSchema = {
  schema:{
    querystring: T.Object({
        awarenessId: T.String(),
        orgId: T.String()
      })
  }
}

const awarenessSchema = {
  schema: {
    body: T.Object({
      orgId: T.String(),
      area: T.Union([T.Literal('classroom'), T.Literal('cafeteria'), T.Literal('office')]),
      areaName: T.String(),
      // classroom: T.Union([
      //   T.Literal('KG'),
      //   T.Literal('1'), T.Literal('2'), T.Literal('3'), T.Literal('4'), T.Literal('5'),
      //   T.Literal('6'), T.Literal('7'), T.Literal('8'), T.Literal('9'), T.Literal('10'),
      //   T.Literal('11'), T.Literal('12')
      // ]),
      awareness_score: T.Integer({ minimum: 0, maximum: 5 }),
      awareness_session_date: T.Number(),
      awareness_min: T.Number(),
    })
  },
}


export default protectedRoute;
