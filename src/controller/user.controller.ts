import UserModel from "../model/user.model";
import {Request, Response, NextFunction} from "express";
import {CustomResponse} from "../util/CustomResponse";
import {JWT_SECRET, NODE_ENV} from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {IUser} from "../type/schema.type";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict" as const,
};

export const register = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            phoneNumber,
            password,
            profilePic
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            firstName,
            lastName,
            username,
            email,
            phoneNumber,
            password: hashedPassword,
            profilePic // optional
        });



        res.status(201).send(new CustomResponse(
            201,
            "User registered successfully"
        ));
    } catch (e) {
        next(e)
    }

};

export const login = async (req: Request, res: Response, next:NextFunction) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username: username }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt
            .sign(
                { userId: user._id, role: user.role },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

        res
            .cookie("access_token", token, COOKIE_OPTIONS)
            .json({
                message: "Login successful",
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });
    } catch (e) {
        next(e)
    }


};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie("access_token").json({ message: "Logged out" });
};