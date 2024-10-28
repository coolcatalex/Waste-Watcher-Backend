import { Schema,model } from "mongoose";


const onboardingSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: "users"
    },
    schoolName: String,
    schoolAddress: String,
    schoolAdminContact: Number,
    avgStudentInClass: Number,
    classrooms:[String],
    offices:Number,
    cafeterias:Number,
    query:{
        type: [Schema.ObjectId],
        ref: "query"
    },    
    weightedScorePercentage: Number,
    latestAwareness: Number
    
})


const onboardingModel = model("onboarding",onboardingSchema)


export default onboardingModel

