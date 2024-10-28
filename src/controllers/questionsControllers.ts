// import axios from "axios";
import questionsModel from "../models/questionsModel.js";
import usersModel from "../models/userModel.js";
// import { sendMail } from "./mailController.js";
// import { verifyIdToken } from "./fcmControllers.js";
import assert from "assert";


export async function updateQuestions({questions,uId}:{
    questions: {
        category: String,
        question: String,
        options: {
            option: String,
            score: Number
        }[],
        maxScore: Number,
        weightage: Number
    }[],
    uId: String
}) {
    try {
        var user = await usersModel.findOne({ _id: uId })
        assert(user, "User not found")
        
        var exists = await questionsModel.exists({})

        if(exists){
            await questionsModel.updateOne({_id: exists._id},{
                $set:{
                    query: questions
                }
            })
        }else{
            await questionsModel.create({
                query: questions
            })
        }
        
        

        return {
            code: 200,
            data: "Updated"
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                msg: error.message,
                code: 401
            }
        }
        return {
            msg: "",
            code: 500
        }
    }
}

export async function getQuestions({uId}:{
    uId: String
}) {
    try {
        // var user = await usersModel.findOne({ _id: uId })
        // assert(user, "User not found")
        
        var questions = await questionsModel.findOne({})

        return {
            code: 200,
            data: questions
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                msg: error.message,
                code: 401
            }
        }
        return {
            msg: "",
            code: 500
        }
    }
}
