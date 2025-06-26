import { Request, Response } from "express";
import { AppDataSource } from "../config/typeorm.config";
import { ApisConfigs } from "../entities/ApisConfigs"
export class ApisConfigController {
    static getRepository() {
        return AppDataSource.getRepository(ApisConfigs);
    }

    static async create(req: Request, res: Response) {
        try {
            const repo = this.getRepository();
            const config = repo.create(req.body);
            await repo.save(config);
            res.status(201).json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const repo = this.getRepository();
            const configs = await repo.find({ relations: ["api"] });
            res.json(configs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const repo = this.getRepository();
            const config = await repo.findOne({
                where: { id: req.params.id },
                relations: ["api"]
            });
            if (!config) return res.status(404).json({ error: "Not found" });
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const repo = this.getRepository();
            let config = await repo.findOne({ where: { id: req.params.id } });
            if (!config) return res.status(404).json({ error: "Not found" });
            repo.merge(config, req.body);
            await repo.save(config);
            res.json(config);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const repo = this.getRepository();
            const config = await repo.findOne({ where: { id: req.params.id } });
            if (!config) return res.status(404).json({ error: "Not found" });
            await repo.remove(config);
            res.json({ message: "Deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
} 