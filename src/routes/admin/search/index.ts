import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type as T } from '@sinclair/typebox'
import * as adminController from '../../../controllers/adminControllers.js'
import dayjs from 'dayjs';

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.get('/getOrgs',getORGSearch, async function (request, reply) {
    // var { uId } = request.user
    var {page,count,search} = request.query
    var data = await adminController.getOrgs({page,count,search})
    reply.code(data.code).send(data.data);
  })

  fastify.get('/entries',getEntriesSearch, async function (request, reply) {
    var searchData = request.query
    var data = await adminController.searchEntries({ ...searchData, uId: searchData.orgId})
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

const getORGSearch = {
  schema:{
    querystring: T.Object({
      search: T.Optional(T.String()),
      page: T.Number({
        default: 1
      }),
      count:T.Number({
        default: 30
      }),
    })
  }
}

const getEntriesSearch = {
  schema:{
    querystring: T.Object({
      orgId: T.String(),
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
      startDate:T.Number({
        default: dayjs().subtract(7,"day").startOf("day").valueOf()
      }),
      endDate:T.Number({
        default: Date.now()
      }),
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
      unit:T.Optional(T.String()),
      classification:T.Optional(T.Union([T.Literal('sorted'), T.Literal('semi_sorted'), T.Literal('sorted')])),
      wasteType:T.Optional(T.Union([T.Literal('paper'), T.Literal('plastic'), T.Literal('organic'), T.Literal('electronic'), T.Literal('others')])),
      category:T.Optional(T.Union([T.Literal('recyclable'), T.Literal('compostable'), T.Literal('non_recyclable')])),
      waste_champion:T.Optional(T.Boolean()),
      
    })
  }
}

export default protectedRoute;
