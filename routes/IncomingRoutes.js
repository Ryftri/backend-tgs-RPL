import express from "express";
import {
    getIncomings,
    getIncomingById,
    createIncoming,
    updateIncoming,
    deleteIncoming
} from "../controllers/IncomingGoods.js"
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/incomings', verifyUser, getIncomings);
router.get('/incomings/:id', verifyUser, getIncomingById);
router.post('/incomings', verifyUser, createIncoming);
router.patch('/incomings/:id', verifyUser, updateIncoming);
router.delete('/incomings/:id', verifyUser, deleteIncoming);

export default router;