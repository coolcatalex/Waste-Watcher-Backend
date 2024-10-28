import onboardingModel from "../models/onboardingModel.js";
import queryModel from "../models/queryModel.js";
import questionsModel from "../models/questionsModel.js";
import usersModel from "../models/userModel.js";
import assert from "assert";


export async function onboarding({onboardData,uId}:{
    onboardData: {
        schoolName: string,
        schoolAddress: string,
        schoolAdminContact: number,
        classrooms: string[],
        offices: number,
        cafeterias: number,
        avgStudentInClass: number,
        // unitOfMeasure: string,
        query:{
            qId: string,
            aId: string
        }[]
    },
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        var questions = await questionsModel.findOne({})
        assert(questions, "Questions not found")

        let totalWeightedScore = 0;
        let totalWeightage = 0;
        
        const data = onboardData.query.map((query)=>{
            var ques = questions?.query.find(q=> q.id == query.qId)
            var ans = ques?.options.find(opt=> opt.id == query.aId)

            return {
                qId: query.qId,
                aId: query.aId,
                category: ques?.category,
                question: ques?.question,
                answer: ans?.option,
                score: ans?.score || 0,
                maxScore: ques?.maxScore || 1,
                weightage: ques?.weightage || 1
            }
        })

        data.forEach(entry => {
            const { score, maxScore, weightage } = entry;
            const weightedScore = (score / maxScore) * weightage;
            totalWeightedScore += weightedScore;
            totalWeightage += weightage;
        });
        const weightedScorePercentage = ((totalWeightedScore / totalWeightage) * 100).toFixed(1);


        const query = await queryModel.create({
            query: data,
        })

        var onboard = await onboardingModel.create({
            user: user._id,
            schoolName: onboardData.schoolName,
            classrooms: onboardData.classrooms,
            schoolAddress: onboardData.schoolAddress,
            schoolAdminContact: onboardData.schoolAdminContact,
            offices: onboardData.offices,
            cafeterias: onboardData.cafeterias,
            avgStudentInClass: onboardData.avgStudentInClass,
            query: [query._id],
            weightedScorePercentage
        })  
        
        await usersModel.updateOne(
            {_id: user._id},
            {
                $set:{
                    onBoardingComplete: true,
                },
                $push:{
                    onBoarding: onboard._id,
                }
            }
        )


        return {
            code: 200,
            data: "Success"
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        return {
            data: "Internal Server Error",
            code: 500
        }
    }
}

export async function updateOnboarding({onboardData,uId}:{
    onboardData: {
        orgId: string
        schoolName?: string,
        schoolAddress?: string,
        schoolAdminContact?: number,
        query?:{
            qId: string,
            aId: string
        }[]
    },
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == onboardData.orgId) != -1, "Previous onboarding not found")
        var questions = await questionsModel.findOne({})
        assert(questions, "Questions not found")

        let totalWeightedScore = 0;
        let totalWeightage = 0;
        
        if(onboardData.query){
            const data = onboardData.query.map((query)=>{
                var ques = questions?.query.find(q=> q.id == query.qId)
                var ans = ques?.options.find(opt=> opt.id == query.aId)
                return {
                    qId: query.qId,
                    aId: query.aId,
                    category:ques?.category,
                    question: ques?.question,
                    answer: ans?.option,
                    score: ans?.score || 0,
                    maxScore: ques?.maxScore || 1,
                    weightage: ques?.weightage || 1
                }
            })
    
            data.forEach(entry => {
                const { score, maxScore, weightage } = entry;
                const weightedScore = (score / maxScore) * weightage;
                totalWeightedScore += weightedScore;
                totalWeightage += weightage;
            });
            const weightedScorePercentage = ((totalWeightedScore / totalWeightage) * 100).toFixed(1);
    
    
            const query = await queryModel.create({
                query: data,
            })
            await onboardingModel.updateOne(
                {_id: onboardData.orgId},
                {
                    $push:{
                        query
                    },
                    $set:{
                        weightedScorePercentage
                    }
                },
            )   
        }else{
            await onboardingModel.updateOne(
                {_id: onboardData.orgId},
                {
                    $set:{
                        schoolName: onboardData.schoolName,
                        schoolAddress: onboardData.schoolAddress,
                        schoolAdminContact: onboardData.schoolAdminContact,
                    }
                },
            ) 
        }
        return {
            code: 200,
            data: "Success"
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        return {
            data: "Internal Server Error",
            code: 500
        }
    }
}

export async function updateOnboardingQuestion({onboardData,uId}:{
    onboardData: {
        orgId: string
        schoolName: string,
        schoolAddress: string,
        schoolAdminContact: number,
        query:{
            qId: string,
            aId: string
        }[]
    },
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == onboardData.orgId) != -1, "Previous onboarding not found")
        var questions = await questionsModel.findOne({})
        assert(questions, "Questions not found")

        let totalWeightedScore = 0;
        let totalWeightage = 0;
        
        const data = onboardData.query.map((query)=>{
            var ques = questions?.query.find(q=> q.id == query.qId)
            var ans = ques?.options.find(opt=> opt.id == query.aId)
            return {
                qId: query.qId,
                aId: query.aId,
                category:ques?.category,
                question: ques?.question,
                answer: ans?.option,
                score: ans?.score || 0,
                maxScore: ques?.maxScore || 1,
                weightage: ques?.weightage || 1
            }
        })

        data.forEach(entry => {
            const { score, maxScore, weightage } = entry;
            const weightedScore = (score / maxScore) * weightage;
            totalWeightedScore += weightedScore;
            totalWeightage += weightage;
        });
        const weightedScorePercentage = ((totalWeightedScore / totalWeightage) * 100).toFixed(1);


        const query = await queryModel.create({
            query: data,
        })

        await onboardingModel.updateOne(
            {_id: onboardData.orgId},
            {
                $push:{
                    query
                },
                $set:{
                    schoolName: onboardData.schoolName,
                    schoolAddress: onboardData.schoolAddress,
                    schoolAdminContact: onboardData.schoolAdminContact,
                    weightedScorePercentage
                }
            }
        )  
        
        return {
            code: 200,
            data: "Success"
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        return {
            data: "Internal Server Error",
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

export async function getOrgs({uId}:{
    uId: String
}) {
    try {
        var user = await usersModel.findOne({ _id: uId })
        assert(user, "User not found")
        
        var data = await onboardingModel.find({_id: {$in:user.onBoarding}},{schoolName:1,weightedScorePercentage:1})

        return {
            code: 200,
            data: data.reduce((acc,obj)=>{
                return {
                    ...acc,
                    [obj.id]:{"schoolName": obj.schoolName,"weightedScorePercentage":obj.weightedScorePercentage}
                }
            },{})
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

export async function getOrgOnboarding({uId,orgId}:{
    uId: String
    orgId: String
}) {
    try {
        var user = await usersModel.exists({ _id: uId })
        assert(user, "User not found")
        
        var onboard = await onboardingModel.findOne({_id: orgId,user: user._id}).lean()
        var prev_query = await queryModel.findOne({_id: onboard?.query.pop()}).lean()
        return {
            code: 200,
            data:{
                ...onboard,
                query: prev_query?.query
            }
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
