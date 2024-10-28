import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type as T } from '@sinclair/typebox'
import * as onboardingController from '../../../controllers/onboardingControllers.js'

const protectedRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
  fastify.post('/', onboardingSchema, async function (request, reply) {
    var onboardData = request.body
    var { uId } = request.user
    var data = await onboardingController.onboarding({ uId, onboardData })
    reply.code(data.code).send(data.data);
  })

  fastify.put('/', onboardingUpdateSchema, async function (request, reply) {
    var onboardData = request.body
    var { uId } = request.user
    var data = await onboardingController.updateOnboarding({ uId, onboardData })
    reply.code(data.code).send(data.data);
  })

  fastify.get('/orgs', async function (request, reply) {
    var { uId } = request.user
    var data = await onboardingController.getOrgs({ uId })
    reply.code(data.code).send(data.data);
  })

  fastify.get('/org', getOrgOnboardingSchema, async function (request, reply) {
    var { uId } = request.user
    var { orgId } = request.query
    var data = await onboardingController.getOrgOnboarding({ uId,orgId })
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

const onboardingSchema = {
  schema: {
    body: T.Object({
      schoolName: T.String(),
      classrooms: T.Array(T.Union([
        T.Literal('KG'),
        T.Literal('1'), T.Literal('2'), T.Literal('3'), T.Literal('4'), T.Literal('5'),
        T.Literal('6'), T.Literal('7'), T.Literal('8'), T.Literal('9'), T.Literal('10'),
        T.Literal('11'), T.Literal('12')
      ])),
      offices: T.Number(),
      cafeterias: T.Number(),
      avgStudentInClass: T.Number(),
      schoolAddress: T.String(),
      schoolAdminContact: T.Number(),
      query: T.Array(
        T.Object({
          qId: T.String(),
          aId: T.String()
        })
      )
    }),
  },
}

const onboardingUpdateSchema = {
  schema: {
    body: T.Object({
      orgId: T.String(),
      schoolName: T.Optional(T.String()),
      schoolAddress: T.Optional(T.String()),
      schoolAdminContact: T.Optional(T.Number()),
      query: T.Optional(T.Array(
        T.Object({
          qId: T.String(),
          aId: T.String()
        })
      ))
    }),
  },
}

const getOrgOnboardingSchema = {
  schema: {
    querystring: T.Object({
      orgId: T.String()
    })
  }
}



export default protectedRoute;
