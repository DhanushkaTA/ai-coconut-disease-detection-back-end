import { Router } from "express";
import {protect} from "../middleware/verify.token";
import { deleteUser, getAllUsers } from "../controller/user.controller";
// import { protect } from "../middleware/auth.middleware";

const router = Router();


router.get("/",
    protect,
    getAllUsers);

router.delete("/:id",
    protect,
    deleteUser);


export default router;
