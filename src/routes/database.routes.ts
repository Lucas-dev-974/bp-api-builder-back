import { Router } from "express";
import { DatabaseController } from "../controllers/database.controller";

const router = Router();

// Database configuration routes
router.post("/credentials", DatabaseController.configureCredentials);
router.get("/status", DatabaseController.getStatus);

export default router; 