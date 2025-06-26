import { ApiConfigMethodEnum, controllerManager } from "../utils/ControllerManager";
import { entitiesManager } from "../utils/EntityClassManager";
import { AppDataSource } from "../config/typeorm.config";
import { ApisConfigs } from "../entities/ApisConfigs";
import { Request, Response } from "express";
import { Apis } from "../entities/Apis";
import { EntitySchema } from "typeorm";

export enum CreateApiModeEnum {
    create = "create",
    use = "use",
    draft = "draft"
}
export type EntityInputFields = { name: string, type: string }[]

export class ApisController {
    public static apiRepo = AppDataSource.getRepository(Apis)
    public static apiConfigRepo = AppDataSource.getRepository(ApisConfigs)

    private static async createEntityAndTables(name: string, schema: EntityInputFields, mode: CreateApiModeEnum, res: Response) {
        try {
            let entity: Partial<EntitySchema> | undefined = undefined

            switch (mode) {
                case CreateApiModeEnum.create:
                    if (entitiesManager.entities.has(name)) return res.status(400).json({ error: "L'entité " + name + " existe déjà, veuillez cochez créer avec l'entité existante et décochez créer une entité.", status: "wait statement" })

                    await entitiesManager.createTable("api_entity_" + name, schema)
                    entity = entitiesManager.getEntitySchema("api_entity_" + name)
                    break

                case CreateApiModeEnum.use:
                    if (!entitiesManager.entities.has(name)) return res.status(400).json({ error: "Vous souhaité créer une api pour à partir de l'entité " + name + ", entité non existante. \n Veuillez cochez la case créer une entité", status: "wait statement" })
                    entity = entitiesManager.getEntitySchema(name)
                    break
            }

            const api = ApisController.apiRepo.create({ name: entitiesManager.cleanTableName(entity?.options?.name as string) })
            await ApisController.apiRepo.save(api)
            return api
        } catch (error) {
            res.status(400).json({ error: error.message })
            return false
        }


    }

    static async create(req: Request, res: Response) {
        let { name, schema, mode } = req.body
        if (!name || !schema || !mode && mode == CreateApiModeEnum.create) return res.status(400).json({ error: "Veuillez renseigner tous les champ" })
        else if (!name) return res.status(400).json({ error: "Veuillez renseigner le champ nom" })

        if (mode == CreateApiModeEnum.create && entitiesManager.getEntitySchema(name)) {
            return res.status(400).json({ status: "wait statement", message: "Une entité du même nom existe déjà, veuillez cochez 'Utilisé une entité existante' ou 'Créer un brouillon'" })
        }

        let api = await ApisController.createEntityAndTables(name, schema, mode, res) as Apis
        if (!api) return

        switch (mode) {
            case CreateApiModeEnum.create:
                Object.keys(ApiConfigMethodEnum).forEach(async key => {
                    const method = key as keyof typeof ApiConfigMethodEnum
                    await controllerManager.buildCRUDApiConf(entitiesManager.getEntitySchema(name) as EntitySchema, ApiConfigMethodEnum[method], api)
                })
                setTimeout(() => { }, 3000)
                break
        }

        const apiRepo = AppDataSource.getRepository(Apis)
        const apis = await apiRepo.findOne({ where: { id: api.id }, relations: ["configs"] })

        return res.status(200).json(apis)
    }

    static async getAll(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Apis);
            const apis = await repo.find({ relations: ["configs"] });
            res.json(apis);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByName(req: Request, res: Response) {
        const { name } = req.params
        if (!name) return res.status(400).json({ error: "Veuillez renseigner le champ 'name'" })

        try {
            const repo = AppDataSource.getRepository(Apis);
            const api = await repo.findOne({
                where: { name: req.params.name },
                relations: ["configs"]
            });
            if (!api) return res.status(404).json({ error: "Not found" });
            res.json(api);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Apis);
            let api = await repo.findOne({ where: { id: req.params.id } });
            if (!api) return res.status(404).json({ error: "Not found" });
            repo.merge(api, req.body);
            await repo.save(api);
            res.json(api);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const repo = AppDataSource.getRepository(Apis);
            const api = await repo.findOne({ where: { id: req.params.id } });
            if (!api) return res.status(404).json({ error: "Not found" });
            await repo.remove(api);
            res.json({ message: "Deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
} 