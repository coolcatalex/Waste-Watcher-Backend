import { Schema,model } from "mongoose";


const questionsSchema = new Schema({
    query:[{
        category:String,
        question: String,
        options: [{
            option: String,
            score: Number,
        }],
        maxScore: Number,
        weightage: Number
    }],
})


const questionsModel = model("questions",questionsSchema)


export default questionsModel

