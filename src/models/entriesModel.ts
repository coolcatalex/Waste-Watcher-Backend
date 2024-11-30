import { Schema,model } from "mongoose";


const entriesSchema = new Schema({
    org:{
        type: Schema.ObjectId,
        ref: "onboarding"
    },
    user:{
        type: Schema.ObjectId,
        ref: "users"
    },
    orgName:String,
    area:{
        type: String,
        enum: ['classroom','cafeteria','office']
    },
    areaName:{
        type: String,
    },
    classroom:{
        type: String,
        enum: ["KG","1","2","3","4","5","6","7","8","9","10","11","12"]
    },
    classType: {
        type: String,
        enum: ["primary","secondary","highschool"]
    },
    unit:String,
    classification:{
        type: String,
        enum: ['sorted','semi_sorted','unsorted']
    },
    wasteType:{
        paper: Number,
        plastic: Number,
        organic: Number,
        electronic: Number,
        others: Number
    },
    weight: Number,
    maturity_score:{
        type: Number,
        validate: {
            validator: function (value:number) {
                return value >= 1 && value <= 10;
            },
            message: 'Maturity score must be between 1 and 10'
        }

    },
    timestamp:Number,
    waste_champion: Boolean,
    createdAt:{
        type: Number,
        default: Date.now
    }
})


const entriesModel = model("entries",entriesSchema)
export default entriesModel

