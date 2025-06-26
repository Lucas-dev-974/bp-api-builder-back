import { log } from "console";
import { AppDataSource } from "../config/typeorm.config";
import { DataSource, EntitySchema, Table, ColumnType, } from "typeorm";
import { TableColumn } from "typeorm";
import { EntityInputFields } from "src/controllers/ApisController";

export class EntitiesManager {
    public entities: Map<string, Partial<EntitySchema>> = new Map();
    private static instance: EntitiesManager;
    private dataSource: DataSource;

    private constructor() {
        this.dataSource = AppDataSource;
    }

    public static getInstance(): EntitiesManager {
        if (!EntitiesManager.instance) {
            EntitiesManager.instance = new EntitiesManager();
        }
        return EntitiesManager.instance;
    }

    public createEntity(name: string, schema: Record<string, any>): any {
        const entitie: Partial<EntitySchema> = {
            options: {
                name: name,
                columns: {}
            }
        }
        this.entities.set(name, entitie)
        return entitie

    }

    private async verifyExistingTable(name: string): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            const tables = await queryRunner.getTables();
            return tables.some(table => table.name.toLowerCase() === name.toLowerCase());
        } finally {
            await queryRunner.release();
        }
    }

    public cleanTableName(name: string) {
        if (!name.startsWith("api_entity_")) return name
        return name.split("_")[2]
    }

    public async createTable(name: string, schema: EntityInputFields): Promise<void> {

        const tableExists = await this.verifyExistingTable(name);
        if (tableExists) throw new Error(`Table ${name} already exists`);


        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const columns = [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment' as const
                },
                ...schema.map(item => ({
                    name: item.name,
                    type: this.mapJsTypeToPostgresType(item.type)
                }))
            ];

            await queryRunner.createTable(
                new Table({
                    name: name,
                    columns: columns
                })
            );
            await queryRunner.commitTransaction();
            await this.buildEntities()
            const entitySchema = await this.getTableFromDb(name)
            this.entities.set(this.cleanTableName(name), entitySchema as Partial<EntitySchema>)
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public getRepository(name: string) {
        const entitySchema = this.getEntitySchema(name);
        if (!entitySchema) {
            throw new Error(`Entity ${name} not found`);
        }
        return this.dataSource.getRepository(entitySchema.options?.name as string);
    }

    public async dropTable(name: string): Promise<void> {
        const tableExists = await this.verifyExistingTable(name);
        if (!tableExists) {
            throw new Error(`Table ${name} does not exist`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.dropTable(name.toLowerCase());
            await queryRunner.commitTransaction();
            this.entities.delete(name);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public async getAllTables(): Promise<Array<{ name: string; schema: Record<string, any> }>> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            const tables = await queryRunner.getTables();
            return tables
                .filter(table => !table.name.startsWith('pg_') && !table.name.startsWith('information_schema'))
                .map(table => {
                    const schema = table.columns.reduce((acc: Record<string, any>, col) => {
                        if (col.name !== 'id') {
                            acc[col.name] = this.mapPostgresTypeToJsType(col.type);
                        }
                        return acc;
                    }, {});

                    return {
                        name: table.name,
                        schema
                    };
                });
        } finally {
            await queryRunner.release();
        }
    }

    private mapPostgresTypeToJsType(postgresType: string): string {
        const typeMap: Record<string, string> = {
            'character varying': 'string',
            'text': 'string',
            'integer': 'number',
            'bigint': 'number',
            'boolean': 'boolean',
            'timestamp': 'string',
            'date': 'string',
            'double precision': 'number',
            'numeric': 'number'
        };

        return typeMap[postgresType] || 'string';
    }

    public async addColumn(tableName: string, columnName: string, columnType: string): Promise<void> {
        const tableExists = await this.verifyExistingTable(tableName);
        if (!tableExists) {
            throw new Error(`Table ${tableName} does not exist`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const table = await queryRunner.getTable(tableName.toLowerCase());
            if (!table) {
                throw new Error(`Table ${tableName} not found`);
            }

            const column = new TableColumn({
                name: columnName,
                type: this.mapJsTypeToPostgresType(columnType)
            });

            await queryRunner.addColumn(table, column);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public async removeColumn(tableName: string, columnName: string): Promise<void> {
        const tableExists = await this.verifyExistingTable(tableName);
        if (!tableExists) {
            throw new Error(`Table ${tableName} does not exist`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const table = await queryRunner.getTable(tableName.toLowerCase());
            if (!table) {
                throw new Error(`Table ${tableName} not found`);
            }

            const column = table.findColumnByName(columnName);
            if (!column) {
                throw new Error(`Column ${columnName} not found in table ${tableName}`);
            }

            await queryRunner.dropColumn(table, column);
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private mapJsTypeToPostgresType(jsType: string): string {
        const typeMap: Record<string, string> = {
            'string': 'VARCHAR(255)',
            'number': 'INTEGER',
            'boolean': 'BOOLEAN',
            'date': 'TIMESTAMP',
            'text': 'TEXT',
            'float': 'DOUBLE PRECISION'
        };

        return typeMap[jsType] || 'VARCHAR(255)';
    }

    public async updateColumnsOfTable(tableName: string, columns: Record<string, string>): Promise<void> {
        const tableExists = await this.verifyExistingTable(tableName);
        if (!tableExists) {
            throw new Error(`Table ${tableName} does not exist`);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const table = await queryRunner.getTable(tableName.toLowerCase());
            if (!table) {
                throw new Error(`Table ${tableName} not found`);
            }

            // Pour chaque colonne dans le schéma
            for (const [columnName, columnType] of Object.entries(columns)) {
                const existingColumn = table.findColumnByName(columnName);
                const newType = this.mapJsTypeToPostgresType(columnType);

                if (existingColumn) {
                    // On crée une nouvelle colonne en préservant les propriétés existantes
                    const newColumn = new TableColumn({
                        name: columnName,
                        type: newType,
                        isNullable: existingColumn.isNullable,
                        default: existingColumn.default,
                        comment: existingColumn.comment
                    });

                    // On modifie la colonne en préservant les données
                    await queryRunner.changeColumn(table, existingColumn, newColumn);
                } else {
                    // Si la colonne n'existe pas, on la crée
                    const newColumn = new TableColumn({
                        name: columnName,
                        type: newType
                    });
                    await queryRunner.addColumn(table, newColumn);
                }
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Construit des schémas d'entités TypeORM à partir des tables existantes en base de données.
     * @returns Une promesse qui se résout en un tableau de EntitySchema.
     */
    public async buildEntities() {
        const tables = await this.getAllTables();
        tables.forEach(table => {
            this.entities.set(this.cleanTableName(table.name), table.schema)
        })
    }

    public getEntitySchema(name: string): Partial<EntitySchema> | undefined {
        const fields = this.entities.get(this.cleanTableName(name));
        if (!fields) return undefined;
        return fields
    }

    public async getTableFromDb(tableName: string): Promise<Partial<EntitySchema> | undefined> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            const table = await queryRunner.getTable(tableName.toLowerCase());
            if (!table) {
                return undefined;
            }

            // Construction des colonnes pour EntitySchema
            const columns: Record<string, any> = {};
            table.columns.forEach(col => {
                columns[col.name] = {
                    type: col.type,
                    primary: col.isPrimary,
                    generated: col.isGenerated ? (col.generationStrategy || true) : false,
                    nullable: col.isNullable,
                    default: col.default,
                    unique: col.isUnique
                };
            });

            return new EntitySchema({
                name: tableName,
                tableName: tableName.toLowerCase(),
                columns
            });
        } finally {
            await queryRunner.release();
        }
    }
}

export const entitiesManager = EntitiesManager.getInstance();