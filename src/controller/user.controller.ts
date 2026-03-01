import { Request, Response, NextFunction } from "express";
import UserModel from "../model/user.model";
import { CustomResponse } from "../util/CustomResponse";


export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const role = (req.query.role as string) || "";

    const skip = (page - 1) * limit;

   const filter: any = {};

    // 🔎 Search filter
    if (search) {
    filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
    ];
    }

    // 👤 Role filter
    if (role) {
        filter.role = role;
    }

    const totalUsers = await UserModel.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await UserModel.find(filter)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(
      new CustomResponse(200, "Users fetched", users, totalPages)
    );
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    if (!user) {
      return res
        .status(404)
        .json(new CustomResponse(404, "User not found"));
    }

    await UserModel.findByIdAndDelete(id);

    res.json(
      new CustomResponse(200, "User deleted successfully")
    );
  } catch (err) {
    next(err);
  }
};