import express from "express";
import {
    getOutGoods,
    getOutGoodsById,
    createOutGoods,
    updateOutGoods,
    deleteOutGoods
} from "../controllers/OutGoods.js"
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/out-goods', verifyUser, getOutGoods);
router.get('/out-goods/:id', verifyUser, getOutGoodsById);
router.post('/out-goods', verifyUser, createOutGoods);
router.patch('/out-goods/:id', verifyUser, updateOutGoods);
router.delete('/out-goods/:id', verifyUser, deleteOutGoods);

export default router;