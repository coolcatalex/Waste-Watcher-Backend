// import axios from "axios";
import usersModel from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import { jwtSign } from "./functions.js";
// import { sendMail } from "./mailController.js";
// import { verifyIdToken } from "./fcmControllers.js";
import { Error } from "mongoose";
import assert from "assert";
import { functionReturn } from "../types.js";


const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)


export async function login({email,password}:{email: string, password: string}): Promise<functionReturn> {
    try {
        var user = await usersModel.findOne({ "email.mail": email })
                                    .select({username:1,email:1,role:1,onBoardingComplete:1,onBoarding:1,awareness_score:1,hashPassword:1})
                                    .populate("onBoarding",{query:0,user:0}).lean()
        assert(user, "User not found")
        var vaild = bcrypt.compareSync(password, user.hashPassword!)
        var token = jwtSign({uId: user._id.toString(),email,role: user.role})
        delete user.hashPassword

        if(user.onBoarding){
            // @ts-ignore
            user.onBoarding = user.onBoarding.reduce((acc,obj)=>{
                return {
                    ...acc,
                    // @ts-ignore
                    [obj._id.toString()]:{
                        ...obj
                    }
                }
            },{})
        }

        if (vaild) {
            return {
                msg: "Success",
                code: 200,
                data: {
                    ...user,
                    token
                }
            }
        } else {
            return {
                msg: "Login Failed",
                code: 401,
            }
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                msg: error.message,
                code: 401
            }
        }
        console.log(error)
        return {
            msg: "",
            code: 500
        }
    }
}

export async function signUp_withEmail({ password, email }: {
    password: string, email: string
}){
    try {
        var hashPassword = bcrypt.hashSync(password, SALT_ROUNDS);
        var name = email.split('@')[0]
        var exists = await usersModel.exists({username:email})
        assert(!exists,"User with same email exists")
        var user = await usersModel.create({
            username: name, hashPassword, email:{
                mail: email,
                verified: true
            },
            firstName: name, lastName: '',
        })
        assert(user, "Can't add user")

        // var token = jwtSign({uId: user.id,email,role:user.role})
        
        
        return {
            code: 200,
            data: "Success"
            // data:{
            //     email: user.email,
            //     username: email,
            //     firstname:  user.firstName,
            //     lastname: user.lastName,
            //     role: user.role,
            //     onBoardingComplete: false,
            //     token
            // }
        }
    } catch (error) {

        if (error instanceof Error) {
            console.log({error})
            return {
                data: error.message,
                code: 401
            }
        }
        
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        console.log(error)
        return {
            data: "Error",
            code: 500
        }
    }
}

export async function profile({ uId }: {
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
                                .select({username:1,email:1,role:1,onBoardingComplete:1,onBoarding:1,awareness_score:1})
                                .populate("onBoarding",{query:0,user:0}).lean()
        return {
            code: 200,
            data: user
        }
    } catch (error) {

        if (error instanceof Error) {
            console.log({error})
            return {
                data: error.message,
                code: 401
            }
        }
        
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        return {
            data: "Error",
            code: 500
        }
    }
}
