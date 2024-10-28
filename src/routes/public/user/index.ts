import * as usersControllers from '../../../controllers/userControllers.js';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { Type as T } from '@sinclair/typebox'


const publicRoute: FastifyPluginAsyncTypebox = async (fastify, opts): Promise<void> => {
    fastify.post('/login', LoginSchema, async function (request, reply) {
        var { email, password } = request.body
        var data = await usersControllers.login({email, password});
        reply.code(data.code).send(data.data)
    })

    fastify.post('/signup', SignUpSchema, async function (request, reply) {
        var { password, email } = request.body
        var data = await usersControllers.signUp_withEmail({ password, email });
        reply.code(data.code).send(data.data)
    })
}


/**
 * Fastify Schemas
 */

const LoginSchema = {
    schema: {
        body: T.Object({
            email: T.String(),
            password: T.String(),
        })
    }
}

const SignUpSchema = {
    schema: {
        body: T.Object({
            password: T.String(),
            email: T.String(),
            // role: T.Enum({
            //     "admin":"admin",
            //     "user":"user"
            // }),
        })
    }
}

// const ForgotSendOtpSchema = {
//     schema: {
//         body: T.Object({
//             email: T.String(),
//         })
//     }
// }

// const verifyEmailSchema = {
//     schema: {
//         querystring: T.Object({
//             token: T.String(),
//         }),
//     },
// }

// const ForgotVerifyOtpSchema = {
//     schema: {
//         body: T.Object({
//             email: T.String(),
//             otp: T.String(),
//         })
//     }
// }

// const ForgotChangePwdSchema = {
//     schema: {
//         body: T.Object({
//             token: T.String(),
//             password: T.String(),
//         })
//     }
// }



// const CheckUsernameSchema = {
//     schema: {
//         body: T.Object({
//             username: T.String(),
//         })
//     }
// }

export default publicRoute;
