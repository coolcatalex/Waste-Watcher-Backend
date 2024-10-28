// import axios from "axios";
import mongoose, { PipelineStage } from "mongoose";
import entriesModel from "../models/entriesModel.js";
import usersModel from "../models/userModel.js";
// import { sendMail } from "./mailController.js";
// import { verifyIdToken } from "./fcmControllers.js";
import assert from "assert";
import onboardingModel from "../models/onboardingModel.js";
import queryModel from "../models/queryModel.js";
// import onboardingModel from "../models/onboardingModel.js";
// import dayjs from "dayjs";


// const classTypeDict = {
//     "KG": "primary",
//     "1": "primary",
//     "2": "primary",
//     "3": "primary",
//     "4": "primary",
//     "5": "primary",
//     "6": "secondary",
//     "7": "secondary",
//     "8": "secondary",
//     "9": "highschool",
//     "10": "highschool",
//     "11": "highschool",
//     "12": "highschool"
// }


export async function stat({ orgId, uId }: {
    orgId: string,
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == orgId) != -1, "Onboarding not found")
        const onboarding = await onboardingModel.findById(orgId).select({classrooms:1,query:1,weightedScorePercentage:1,avgStudentInClass:1})
        assert(onboarding, "Onboarding not found")

        const waste = await entriesModel.aggregate([{
                $match: {
                    org: new mongoose.Types.ObjectId(orgId),
                    ...(onboarding.latestAwareness && {timestamp: {$gte: onboarding.latestAwareness}})
                }
            },
            {
                $group: {
                    _id: null,
                    count: {$sum: 1},
                    weight: { $sum: "$weight" }
                }
            }
        ]);
        
        if(!onboarding.avgStudentInClass){
            onboarding.avgStudentInClass = 1
        }

        const wasteClassPerDay = waste[0].weight / waste[0].count
        const wasteStudentDay = wasteClassPerDay/onboarding.avgStudentInClass
        const wasteStudentMonth = wasteStudentDay * 20
        const wasteStudentYear = wasteStudentDay * 220
        const totalWasteBySchoolYear = wasteStudentYear * onboarding.classrooms.length * onboarding.avgStudentInClass



        const query = await queryModel.findById(onboarding.query.pop())
        const radarData = query?.query.reduce((acc:Record<string,number>,cur)=>{
            if(cur.category && cur.score){
                if (cur.category in acc){
                    acc[cur.category] += cur.score
                }else{
                    acc[cur.category] = cur.score
                }
            }
            return acc
        },{})

        return {
            code: 200,
            data:{
                // waste,
                wasteClassPerDay: wasteClassPerDay.toFixed(1),
                wasteStudentDay: wasteStudentDay.toFixed(1),
                wasteStudentMonth: wasteStudentMonth.toFixed(1),
                wasteStudentYear: wasteStudentYear.toFixed(1),
                totalWasteBySchoolYear: totalWasteBySchoolYear.toFixed(1),
                radarData,
                weightedScorePercentage: onboarding.weightedScorePercentage
            }
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        console.log(error)
        return {
            data: "Internal Server Error",
            code: 500
        }
    }
}

export async function search({ startDate,endDate,sort,page,count,direction,area,classroom,classType,unit,classification,wasteType,category,waste_champion,createdAtstartDate,createdAtendDate,uId }: {
    startDate?: number,
    endDate?: number,
    createdAtstartDate?: number,
    createdAtendDate?: number,
    sort: string,
    page: number,
    count: number,
    direction: 1 | -1
    uId: string,
    area?: 'classroom' | 'cafeteria' | 'office';
    classroom?: 'KG' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    classType?: "primary" | "secondary" | "highschool";
    unit?: string;
    classification?: 'sorted' | 'semi_sorted' | 'unsorted';
    wasteType?: 'paper' | 'plastic' | 'organic' | 'electronic' | 'others';
    category?: 'recyclable' | 'compostable' | 'non_recyclable';
    waste_champion?: Boolean;
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")

        const pipeline: PipelineStage[] = [];

        const match: PipelineStage.Match['$match']  = { user: user._id };
        // const match: PipelineStage.Match['$match']  = { user: user._id, timestamp: { $gte: startDate, $lte: endDate } };
        if(startDate && endDate){
            match['timestamp'] = { $gte: startDate, $lte: endDate }
        }

        if(createdAtstartDate && createdAtendDate){
            match['createdAt'] = { $gte: createdAtstartDate, $lte: createdAtendDate }
        }

        if (area) match.area = area;
        if (classroom) match.classroom = classroom;
        if (classType) match.classType = classType;
        if (unit) match.unit = unit;
        if (classification) match.classification = classification;
        if (wasteType) match.wasteType = wasteType;
        if (category) match.category = category;
        if (typeof waste_champion === 'boolean') match.waste_champion = waste_champion;

        pipeline.push(
            { $match: match },
            {
                $facet: {
                    totalDocuments: [
                        { $count: "count" }
                    ],
                    entries: [
                        { $sort: { [sort]: direction } },
                        { $skip: (page - 1) * count },
                        { $limit: count }
                    ]
                }
            },
            {
                $project: {
                    totalDocuments: { $arrayElemAt: ["$totalDocuments.count", 0] },
                    entries: 1
                }
            }
        );

        var entries = await entriesModel.aggregate(pipeline)

        return {
            code: 200,
            data: entries[0]
        }

    } catch (error) {
        if (error instanceof assert.AssertionError) {
            return {
                data: error.message,
                code: 401
            }
        }
        console.log(error)
        return {
            data: "Internal Server Error",
            code: 500
        }
    }
}

export async function deleteEntry({ entryId, uId }: {
    entryId: String,
    uId: String
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")

        await entriesModel.deleteOne({ _id: entryId,user: user._id })

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
