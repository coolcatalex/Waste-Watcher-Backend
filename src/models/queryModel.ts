import { Schema,model } from "mongoose";


const querySchema = new Schema({
    query:[{
        category:String,
        qId: String,
        aId: String,
        question: String,
        answer: String,
        score: Number,
        maxScore: Number,
        weightage: Number
    }],
    timestamp:{
        type: Number,
        default: Date.now
    }
})


const queryModel = model("query",querySchema)


export default queryModel

