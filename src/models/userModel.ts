import { Schema,model } from "mongoose";


const usersSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    hashPassword: String,
    firstName: String,
    lastName: String,
    email: {
        mail: {
            type: String,
            unique: true
        },
        verified:Boolean
    },
    token:{
        type: String
    },
    role:{
        type: String,
        enum:["admin","user"],
        default: "user"
    },
    disable:{
        type: Boolean,
        default: false
    },
    awareness_score:{
        type: Number,
        default: 0
    },
    onBoardingComplete:{
        type: Boolean,
        default: false
    },
    onBoarding:{
        type: [Schema.ObjectId],
        ref: "onboarding"
    }
    
})


const usersModel = model("users",usersSchema)


export default usersModel

