import UserModel from "../model/user.model";
import {IUser} from "./schema.type";
//
// declare global {
//     namespace Express {
//         interface Request {
//             user?: IUser; // make it optional
//         }
//     }
// }
declare module 'express-serve-static-core' {
    interface Request {
        user?: IUser;
    }
}
