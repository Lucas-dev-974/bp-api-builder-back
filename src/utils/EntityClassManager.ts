import { AppDataSource } from "../config/typeorm.config";
import { DataSource } from "typeorm";
import { Table, TableColumn } from "typeorm";

class EntityClassManager {
    private static instance: EntityClassManager;
    private entityClasses: Map<string, any> = new Map();
    private dataSource: DataSource;

    private constructor() {
        this.dataSource = AppDataSource;
    }

    public static getInstance(): EntityClassManager {
        if (!EntityClassManager.instance) {
            EntityClassManager.instance = new EntityClassManager();
        }
        return EntityClassManager.instance;
    }

    public createEntityClass(name: string, schema: Record<string, any>): any {
        // Créer une classe d'entité dynamique
        const EntityClass = class {
            id: number;
            [key: string]: any;
        };

        // Ajouter les propriétés basées sur le schéma
        Object.entries(schema).forEach(([key, value]) => {
            EntityClass.prototype[key] = value;
        });

        // Enregistrer la classe dans le Map
        this.entityClasses.set(name, EntityClass);

        return EntityClass;
    }

    public getEntityClass(name: string): any {
        return this.entityClasses.get(name);
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

    public async createTable(name: string, schema: Record<string, any>): Promise<void> {
        const tableExists = await this.verifyExistingTable(name);
        if (tableExists) {
            throw new Error(`Table ${name} already exists`);
        }

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
                ...Object.entries(schema).map(([key, value]) => ({
                    name: key,
                    type: this.mapJsTypeToPostgresType(value)
                }))
            ];

            await queryRunner.createTable(
                new Table({
                    name: name.toLowerCase(),
                    columns: columns
                })
            );
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public getRepository(name: string) {
        const EntityClass = this.getEntityClass(name);
        if (!EntityClass) {
            throw new Error(`Entity class ${name} not found`);
        }
        return this.dataSource.getRepository(EntityClass);
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
            this.entityClasses.delete(name);
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
}

export const entityClassManager = EntityClassManager.getInstance();