import { randomInt } from "crypto";
import jwt from 'jsonwebtoken';

export function generateOTP(len=6) {
    return randomInt(100000, 1000000).toString().slice(0, len);
}

export function jwtSign(data:Record<string,string>):string{
    return jwt.sign(data,process.env.JWT_SECRET)
}
export function jwtVerify(token:string){
    return jwt.verify(token,process.env.JWT_SECRET)
}
