import express from "express";
import jwt, {Secret} from "jsonwebtoken";
import * as process from "process";
import {promisify} from "util";
import {AppError} from "../util/AppError";
import * as StatusCodes from '../util/StatusCode'
// import {TokenData} from "../type/CustomeTypes";
import * as StatusCode from "../util/StatusCode";
import * as Role from "../util/Role";
import {JWT_SECRET} from "../config/env";
import UserModel from "../model/user.model";
// import * as AdminAuthService from "../services/AdminAuthService";

export const verifyToken = async (req:any, res:express.Response, next:express.NextFunction) => {

    try {

        console.log(req.headers.authorization)

        // [Bearer <token>]
        //that's why authorizationToken split from ''(space)
        //then we can get jwt token
        let token: string | null = null;

        //1) Extract token from authorization header

        if (req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)){
            token = req.headers.authorization.split(" ")[1];
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


        // let is_blackList = await AuthService.checkIsBlackList(token);

        // if (is_blackList){
        //     return next(
        //         new AppError(
        //             "Black listed token! You can't use this any longer!",
        //             401,
        //             StatusCode.UNAUTHORIZED_ACCESS
        //         )
        //     )
        // }


        //3) Check token is verified

        // const decodedData =
        //     await promisify<string, Secret, TokenData>(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET as Secret);

        // @ts-ignore
        const decodedData:any = await promisify(jwt.verify)(token, JWT_SECRET as Secret);
        console.log(decodedData)

        //4) Check user is still exists

        const user =
            await UserModel.findById(decodedData.userId, undefined, undefined);

        console.log(user)


        // If user not found send error

        //!user_or_sub_user.isActive

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