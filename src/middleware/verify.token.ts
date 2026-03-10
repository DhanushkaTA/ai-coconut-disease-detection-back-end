import express from "express";
import jwt, {Secret} from "jsonwebtoken";u
import {promisify} from "util";
import {AppError} from "../util/AppError";
import * as StatusCodes from '../util/StatusCode'
import * as StatusCode from "../util/StatusCode";
import {JWT_SECRET} from "../config/env";
import UserModel from "../model/user.model";

export const protect = async (req:any, res:express.Response, next:express.NextFunction) => {

    try {

        let token: string | null = null;

        //1) Extract token from authorization cookies
        if (req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
        }

        // Sent error msg if token not found in headers
        if (!token){
            return next(
                new AppError(
                    "Token not found!",
                    401,
                    StatusCode.StatusCodes.JWT_NOT_FOUND)
            );
        }

        //2) Check token is blacklisted or not

        // @ts-ignore
        const decodedData:any = await promisify(jwt.verify)(token, JWT_SECRET as Secret);
        // console.log(decodedData)

        //4) Check user is still exists

        const user =
            await UserModel.findById(decodedData._id, undefined, undefined);

        if (!user){

            // add token in to blacklist
            // await AuthService.addAccessTokenToBlackList(token);

            return next(
                new AppError(
                    "The user no longer exists!",
                    401,
                    StatusCodes.StatusCodes.INVALID_TOKEN
                )
            )
        }


        //4) Check token creation time with update password time


        //GRANT ACCESS TO PROTECTED ROUTE
        req.user = decodedData;
        next();

    }catch (error) {
        console.log('Error 💥 ',error.message)
        return next(error)
    }

}