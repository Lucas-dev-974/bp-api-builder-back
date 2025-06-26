import { DatabaseController } from "../controllers/DatabaseController";
import { Router } from "express";

const router = Router();

// Database configuration routes
router.post("/credentials", DatabaseController.configureCredentials);
router.get("/status", DatabaseController.getStatus);

export default router; 