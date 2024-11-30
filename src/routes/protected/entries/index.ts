import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type as T } from '@sinclair/typebox'
import * as entriesController from '../../../controllers/entriesControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.post('/',entrySchema, async function (request, reply) {
    var entry = request.body
    var {uId} = request.user
    var data = await entriesController.add({ uId,entry })
    reply.code(data.code).send(data.data);
  })

  fastify.delete('/',deleteEntrySchema, async function (request, reply) {
    var {entryId,orgId} = request.query
    var {uId} = request.user
    var data = await entriesController.deleteEntry({ uId, entryId,orgId})
    reply.code(data.code).send(data.data);
  })

  fastify.post('/search',getSearch, async function (request, reply) {
    var searchData = request.body
    var {uId} = request.user
    var data = await entriesController.search({ ...searchData, uId})
    reply.code(data.code).send(data.data);
  })

  fastify.post('/all',getAllSearch, async function (request, reply) {
    var searchData = request.body
    var {uId} = request.user
    var data = await entriesController.all({ ...searchData, uId})
    reply.code(data.code).send(data.data);
  })
}

/**
 * Fastify Schemas
 */


const getAllSearch = {
  schema:{
    body: T.Object({
      orgId: T.String(),
      sort:T.String({
        default: "timestamp"
      }),
      direction:T.Union([T.Literal(1),T.Literal(-1)],{
        default: -1
      }),
      startDate:T.Optional(T.Number()),
      endDate:T.Optional(T.Number()),
      areaname:T.Optional(T.Array(T.String())),
    })
  }
}

const getSearch = {
  schema:{
    body: T.Object({
      // search: T.Optional(T.String()),
      page: T.Number({
        default: 1
      }),
      orgId: T.String(),
      count:T.Number({
        default: 30
      }),
      sort:T.String({
        default: "timestamp"
      }),
      direction:T.Union([T.Literal(1),T.Literal(-1)],{
        default: -1
      }),
      fromLastAwareness:T.Boolean({
        default: false
      }),
      startDate:T.Optional(T.Number()),
      endDate:T.Optional(T.Number()),
      createdAtstartDate:T.Optional(T.Number()),
      createdAtendDate:T.Optional(T.Number()),
      area:T.Optional(T.Union([T.Literal('classroom'), T.Literal('cafeteria'), T.Literal('office')])),
      areaname:T.Optional(T.Array(T.String())),
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
      unit:T.Optional(T.String()),
      classification:T.Optional(T.Union([T.Literal('sorted'), T.Literal('semi_sorted'), T.Literal('unsorted')])),
      // wasteType:T.Optional(T.Union([T.Literal('paper'), T.Literal('plastic'), T.Literal('organic'), T.Literal('electronic'), T.Literal('others')])),
      // category:T.Optional(T.Union([T.Literal('recyclable'), T.Literal('compostable'), T.Literal('non_recyclable')])),
      waste_champion:T.Optional(T.Boolean()),
    })
  }
}

const deleteEntrySchema = {
  schema:{
    querystring: T.Object({
        entryId: T.String(),
        orgId: T.String()
      })
  }
}

const entrySchema = {
  schema: {
    body: T.Object({
      orgId: T.String(),
      area: T.Union([T.Literal('classroom'), T.Literal('cafeteria'), T.Literal('office')]),
      areaName: T.String(),
      classroom: T.Optional(T.Union([
        T.Literal('KG'),
        T.Literal('1'), T.Literal('2'), T.Literal('3'), T.Literal('4'), T.Literal('5'),
        T.Literal('6'), T.Literal('7'), T.Literal('8'), T.Literal('9'), T.Literal('10'),
        T.Literal('11'), T.Literal('12')
      ])),
      // classType: T.Optional(T.Union([
      //   T.Literal("primary"),
      //   T.Literal("secondary"),
      //   T.Literal("highschool")
      // ])),
      weight:T.Number(),
      unit: T.String(),
      classification: T.Union([T.Literal('sorted'), T.Literal('semi_sorted'), T.Literal('unsorted')]),
      wasteType: T.Object({
        paper: T.Number(),
        plastic: T.Number(),
        organic: T.Number(),
        electronic: T.Number(),
        others: T.Number()
      }),
      // category: T.Union([T.Literal('recyclable'), T.Literal('compostable'), T.Literal('non_recyclable')]),
      // awareness_score: T.Optional(T.Integer({ minimum: 0, maximum: 5 })),
      // awareness_session_date: T.Optional(T.Number()),
      waste_champion: T.Boolean(),
      // avgStudentInClass: T.Number(),
      timestamp: T.Number()
    })
  },
}


export default protectedRoute;
