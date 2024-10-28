// import axios from "axios";
import { PipelineStage } from "mongoose";
import entriesModel from "../models/entriesModel.js";
import usersModel from "../models/userModel.js";
// import { sendMail } from "./mailController.js";
// import { verifyIdToken } from "./fcmControllers.js";
import assert from "assert";


// type ENTRYTYPE = {
//     area: 'classroom' | 'cafeteria' | 'office';
//     classroom?: 'kg' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
//     classType?: "primary" | "secondary" | "highschool";
//     unit: string;
//     classification: 'sorted' | 'semi_sorted' | 'sorted';
//     wasteType: 'paper' | 'plastic' | 'organic' | 'electronic' | 'others';
//     category: 'recyclable' | 'compostable' | 'non_recyclable';
//     awareness_score: number;
//     maturity_score: number;
//     awareness_session_date: number;
//     waste_champion: boolean;
//     avgStudentInClass: number;
// }

export async function searchEntries({ startDate,endDate,sort,page,count,direction,area,classroom,classType,unit,classification,wasteType,category,waste_champion,uId }: {
    startDate: number,
    endDate: number,
    sort: string,
    page: number,
    count: number,
    direction: 1 | -1
    uId: string,
    area?: 'classroom' | 'cafeteria' | 'office';
    classroom?: 'KG' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
    classType?: "primary" | "secondary" | "highschool";
    unit?: string;
    classification?: 'sorted' | 'semi_sorted' | 'sorted';
    wasteType?: 'paper' | 'plastic' | 'organic' | 'electronic' | 'others';
    category?: 'recyclable' | 'compostable' | 'non_recyclable';
    waste_champion?: Boolean;
}) {
    try {
        var user = await usersModel.exists({_id: uId})
        assert(user, "User not found")

        const pipeline: PipelineStage[] = [];

        const match: PipelineStage.Match['$match']  = { user: user._id, timestamp: { $gte: startDate, $lte: endDate } };

        if (area) match.area = area;
        if (classroom) match.classroom = classroom;
        if (classType) match.classType = classType;
        if (unit) match.unit = unit;
        if (classification) match.classification = classification;
        if (wasteType) match.wasteType = wasteType;
        if (category) match.category = category;
        if (typeof waste_champion === 'boolean') match.waste_champion = waste_champion;

        pipeline.push(
            { $match: match},
            { $sort: { [sort]: direction } },
            { $skip: (page - 1) * count },
            { $limit: count },
        );


        var entries = await entriesModel.aggregate(pipeline)

        return {
            code: 200,
            data: entries
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


export async function getOrgs({search,page,count}:{
    count:number,
    page:number,
    search?:string
}) {
    try {
        var data = await usersModel.find({role:"user",onBoardingComplete:true,schoolName:{$regex:search || '',$options: 'i'}})
                                        .select({ username: 1,schoolName:1 })
                                        .skip((page - 1) * count)
                                        .limit(count);
        return {
            code: 200,
            data
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



