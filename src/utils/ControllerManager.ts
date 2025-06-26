import { ApisController } from "../controllers/ApisController";
import { EntitySchema } from "typeorm";
import { Apis } from "../entities/Apis";

export enum ApiConfigMethodEnum {
    get = "GET",
    post = "POST",
    patch = "PATCH",
    delete = "DELETE"
}

type ApiConfigGet = {
    select: string[] | "*",
    filters?: Record<string, any>,
    relations?: string[]
}

type ApiConfigPost = {
    fields: string[] | "*",
    required?: string[] | "*",
    unique?: string[]
}

type ApiConfigPatch = {
    fields: string[] | "*",
    required?: string[] | "*",
    unique?: string[],
    allowPartial?: true
}

type ApiConfigDelete = {
    required: string
}

export type ApiConfig = {
    name: string,
    model: string,
    isEnable?: boolean,
    method: ApiConfigMethodEnum
    config: ApiConfigGet | ApiConfigPost | ApiConfigPatch | ApiConfigDelete
}


class ApiConfigManager {
    private static instance: ApiConfigManager;
    public configs: Map<string, Map<string, ApiConfig>> = new Map()//  * second map is for method and first for the config we want 

    private constructor() { }

    /**
     * Retourne l'instance singleton de ControllerManager
     */
    public static getInstance(): ApiConfigManager {
        if (!ApiConfigManager.instance) {
            ApiConfigManager.instance = new ApiConfigManager();
        }
        return ApiConfigManager.instance;
    }

    /**
     * Register api config by method for an api name
     */
    public registerConfig(config: ApiConfig): void {
        if (!this.configs.has(config.name)) {
            this.configs.set(config.name, new Map().set(config.method, config));
            return
        }

        const conf = this.configs.get(config.name)
        conf?.set(config.method, config)
        this.configs.set(config.name, conf as Map<string, ApiConfig>)

    }

    /**
     * return mapped config by method for api name of map apiName > map<method, config> 
     */
    public getConfigsByName(name: string): Map<string, ApiConfig> | undefined {
        return this.configs.get(name)
    }

    public async buildCRUDApiConf(model: EntitySchema, crudOption: ApiConfigMethodEnum, api: Apis) {
        let baseApiConf: Partial<ApiConfig> = {
            name: model.options.name.split("_") ? model.options.name.split("_")[2] : model.options.name,
            model: model.options.name,
            method: crudOption,
        }

        switch (crudOption) {
            case ApiConfigMethodEnum.get:
                baseApiConf.config = {
                    select: "*",
                }
                break

            case ApiConfigMethodEnum.post:
                baseApiConf.config = {
                    fields: "*"
                }
                break

            case ApiConfigMethodEnum.patch:
                baseApiConf.config = {
                    fields: "*"
                }
                break

            case ApiConfigMethodEnum.delete:
                baseApiConf.config = {
                    required: "id"
                }
        }

        try {
            const config = ApisController.apiConfigRepo.create({
                api: api,
                ...baseApiConf
            })
            await ApisController.apiConfigRepo.save(config)
            this.registerConfig(baseApiConf as ApiConfig)
            return api
        } catch (error) {
            console.log(error);
            return false
        }

    }

}

export const controllerManager = ApiConfigManager.getInstance()