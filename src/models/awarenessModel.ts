import { Schema,model } from "mongoose";

const awarenessSchema = new Schema({
    user:{
        type: Schema.ObjectId,
        ref: "users"
    },
    orgId: {
        type: Schema.ObjectId,
        ref: "onboarding"
    },
    instructor:String,
    awareness_min:Number,
    area:{
        type: String,
        enum: ['classroom','cafeteria','office']
    },
    areaName:{
        type: String,
    },
    awareness_score:{
        type: Number,
        validate: {
            validator: function (value:number) {
                return value >= 0 && value <= 5;
            },
            message: 'Awareness score must be between 0 and 5'
        }

    },
    awareness_session_date:Number,
    createdAt:{
        type: Number,
        default: Date.now
    }
})


const awarenessModel = model("awareness",awarenessSchema)


export default awarenessModel

