import mongoose, { PipelineStage } from "mongoose";
import usersModel from "../models/userModel.js";
import assert from "assert";
import awarenessModel from "../models/awarenessModel.js";
import entriesModel from "../models/entriesModel.js";
import dayjs from "dayjs";
import onboardingModel from "../models/onboardingModel.js";


type SESSIONTYPE = {
    orgId: string;
    area: 'classroom' | 'cafeteria' | 'office';
    areaName: string;
    // classroom?: 'KG' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    awareness_score?: number;
    awareness_session_date?: number;
}

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


export async function add({ session, uId }: {
    session: SESSIONTYPE,
    uId: String
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == session.orgId) != -1, "Onboarding not found")

        var timestamp = dayjs(session.awareness_session_date)
        var exists = await awarenessModel.findOne({
            awareness_session_date:{
                $gte:timestamp.startOf("day").valueOf(),
                $lte:timestamp.endOf("day").valueOf(),
            },
            areaName: session.areaName,
            orgId: session.orgId
        })
        
        assert(!exists,`You have already filled it's entry on ${new Date(exists?.createdAt!).toLocaleString()}`)

        // var onboardData = await onboardingModel.findById(session.orgId)
        // assert(onboardData,"Onboarding data not found, please login again")
        
        await awarenessModel.create({
            ...session,
            user: uId,
        })

        await onboardingModel.updateOne(
            {_id: new mongoose.Types.ObjectId(session.orgId)},
            {
                $set:{
                    latestAwareness: Date.now()
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
        console.log(error)
        return {
            data: "Internal Server Error",
            code: 500
        }
    }
}

export async function search({ orgId, startDate,endDate,sort,page,count,direction,area,classroom,classType,createdAtstartDate,createdAtendDate,uId }: {
    startDate?: number,
    endDate?: number,
    createdAtstartDate?: number,
    createdAtendDate?: number,
    sort: string,
    page: number,
    count: number,
    direction: 1 | -1
    uId: string,
    orgId?: string,
    area?: 'classroom' | 'cafeteria' | 'office';
    classroom?: 'KG' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    classType?: "primary" | "secondary" | "highschool";
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
        if (orgId) match.orgId = new mongoose.Types.ObjectId(orgId);
        if (classroom) match.classroom = classroom;
        if (classType) match.classType = classType;
console.log(match)
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

        var entries = await awarenessModel.aggregate(pipeline)

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

export async function deleteAwareness({ orgId,awarenessId, uId }: {
    awarenessId: string,
    orgId: string,
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == orgId) != -1, "Onboarding not found")

        await awarenessModel.deleteOne({ _id: awarenessId,user: user._id,orgId: new mongoose.Types.ObjectId(orgId) })

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



export async function stat({ orgId, uId }: {
    orgId: string,
    uId: string
}) {
    try {
        var user = await usersModel.findById(uId)
        assert(user, "User not found")
        assert(user.onBoardingComplete, "Onboarding is not completed, please complete it")
        assert(user.onBoarding.findIndex(q=>q._id.toString() == orgId) != -1, "Onboarding not found")
        const now = dayjs();

        // just for an year
        const wasteEntry = await entriesModel.aggregate([{
                $match: {
                    org: new mongoose.Types.ObjectId(orgId),
                    timestamp:{
                        $lte:now.endOf("day").valueOf(),
                        $gte:now.subtract(12,'month').endOf("day").valueOf(),
                    }
                }
            },
            {
                $group: {
                    _id: {

                        date: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$timestamp" } } },
                    },
                    weight: { $sum: "$weight" }
                }
            },
            {
                $sort: {"_id.date": 1 } 
            }
        ]);

        const awarenessEntry = await awarenessModel.find({
            orgId: new mongoose.Types.ObjectId(orgId),
            awareness_session_date:{
                $lte:now.startOf("day").valueOf(),
                $gte:now.subtract(12,'month').endOf("day").valueOf(),
            }
        }).select({awareness_session_date:1});


        return {
            code: 200,
            data:{
                wasteEntry: wasteEntry.map(entry=>({date:entry._id.date,weight: entry.weight})),
                awarenessEntry
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