// import axios from "axios";
import mongoose, { PipelineStage } from "mongoose";
import entriesModel from "../models/entriesModel.js";
import usersModel from "../models/userModel.js";
// import { sendMail } from "./mailController.js";
// import { verifyIdToken } from "./fcmControllers.js";
import assert from "assert";
import onboardingModel from "../models/onboardingModel.js";
import dayjs from "dayjs";


type ENTRYTYPE = {
    orgId: string;
    area: 'classroom' | 'cafeteria' | 'office';
    areaName: string;
    weight: number;
    classroom?: 'KG' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    unit: string;
    classification: 'sorted' | 'semi_sorted' | 'unsorted';
    wasteType: {
        paper: number,
        plastic: number,
        organic: number,
        electronic: number,
        others: number
    };
    // category: 'recyclable' | 'compostable' | 'non_recyclable';
    // awareness_score?: number;
    timestamp: number;
    // awareness_session_date?: number;
    waste_champion: boolean;
    // avgStudentInClass: number;
}

const classTypeDict = {
    "KG": "primary",
    "1": "primary",
    "2": "primary",
    "3": "primary",
    "4": "primary",
    "5": "primary",
    "6": "secondary",
    "7": "secondary",
    "8": "secondary",
    "9": "highschool",
    "10": "highschool",
    "11": "highschool",
    "12": "highschool"
}


export async function add({ entry, uId }: {
    entry: ENTRYTYPE,
    uId: String
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == entry.orgId) != -1, "Onboarding not found")

        var timestamp = dayjs(entry.timestamp)
        var exists = await entriesModel.findOne({
            user: user._id,
            timestamp:{
                $gte:timestamp.startOf("day").valueOf(),
                $lte:timestamp.endOf("day").valueOf(),
            },
            areaName: entry.areaName,
            org: entry.orgId
        })
        
        assert(!exists,`You have already filled it's entry on ${new Date(exists?.createdAt!).toLocaleString()}`)
        assert(Object.values(entry.wasteType).reduce((acc,cur)=>acc+cur,0) === 100,"Waste type values are invaild")


        Object.entries(entry.wasteType).forEach(([key,val])=>{
            // @ts-ignore
            entry.wasteType[key] = entry.weight * (val/100)
        })

        var onboardData = await onboardingModel.findById(entry.orgId)
        assert(onboardData,"Onboarding data not found, please login again")

        // user.awareness_score = entry.awareness_score || user.awareness_score
        // user.awareness_score = entry.awareness_score || 0
        // await user.save()
        
        await entriesModel.create({
            ...entry,
            user: uId,
            org: onboardData._id,
            orgName: onboardData.schoolName,
            areaName: entry.areaName,
            // awareness_score: user.awareness_score,
            weight: entry.weight,
            maturity_score: onboardData?.weightedScorePercentage!/10,
            ...(entry.classroom !== undefined && { classType: classTypeDict[entry.classroom] })
        })

        console.log({
            ...entry,
            user: uId,
            org: onboardData._id,
            orgName: onboardData.schoolName,
            areaName: entry.areaName,
            // awareness_score: user.awareness_score,
            weight: entry.weight,
            maturity_score: onboardData?.weightedScorePercentage!/10,
            ...(entry.classroom !== undefined && { classType: classTypeDict[entry.classroom] })
        })


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
        console.log(error)
        return {
            data: "Internal Server Error",
            code: 500
        }
    }
}

export async function search({areaname, orgId,fromLastAwareness,startDate,endDate,sort,page,count,direction,area,classroom,classType,unit,classification,wasteType,category,waste_champion,createdAtstartDate,createdAtendDate,uId }: {
    startDate?: number,
    endDate?: number,
    createdAtstartDate?: number,
    createdAtendDate?: number,
    sort: string,
    orgId: string,
    areaname?: string,
    page: number,
    count: number,
    fromLastAwareness: Boolean,
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
        assert(user.onBoarding.findIndex(q=>q._id.toString() == orgId) != -1, "Onboarding not found")

        const pipeline: PipelineStage[] = [];

        const match: PipelineStage.Match['$match']  = {org: new mongoose.Types.ObjectId(orgId) };
        // const match: PipelineStage.Match['$match']  = { user: user._id, timestamp: { $gte: startDate, $lte: endDate } };
        if(startDate && endDate){
            match['timestamp'] = { $gte: startDate, $lte: endDate }
        }

        if(createdAtstartDate && createdAtendDate){
            match['createdAt'] = { $gte: createdAtstartDate, $lte: createdAtendDate }
        }

        if(fromLastAwareness){
            var onboard = await onboardingModel.findById(orgId).select("latestAwareness")
            if(onboard?.latestAwareness){
                match['timestamp'] = { $gte: onboard.latestAwareness }
            }
        }

        if (area) match.area = area;
        if (areaname) match.areaName = areaname;
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

export async function deleteEntry({ entryId, uId,orgId }: {
    entryId: string,
    orgId: string,
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == orgId) != -1, "Onboarding not found")

        await entriesModel.deleteOne({ _id: entryId,user: user._id, org: new mongoose.Types.ObjectId(orgId) })

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
