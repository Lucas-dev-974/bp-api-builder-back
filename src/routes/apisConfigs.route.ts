import { Router } from "express";
import { ApisConfigController } from "../controllers/ApisConfigController";

const router = Router();

router.post("/", ApisConfigController.create);
router.get("/", ApisConfigController.getAll);
router.get("/:id", ApisConfigController.getById);
router.put("/:id", ApisConfigController.update);
router.delete("/:id", ApisConfigController.delete);

export default router; 