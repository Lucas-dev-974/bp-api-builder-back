import { Request, Response } from "express";
import { entityClassManager } from "../utils/EntityClassManager";

export class DynamicEntityController {
  async create(req: Request, res: Response) {
    try {
      const { name, schema } = req.body;
      await entityClassManager.createTable(name, schema);
      return res.status(201).json({
        message: `Table ${name} created successfully`,
        schema
      });
    } catch (error) {
      return res.status(500).json({ message: "Error creating table", error: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const tables = await entityClassManager.getAllTables();
      return res.json(tables);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tables", error });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const repository = entityClassManager.getRepository(name);
      const data = await repository.find();
      return res.json(data);
    } catch (error) {
      return res.status(404).json({ message: "Table not found", error });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { name } = req.params;
      await entityClassManager.dropTable(name);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting table", error });
    }
  }

  async updateColumns(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const { columns } = req.body;
      await entityClassManager.updateColumnsOfTable(name, columns);
      return res.status(200).json({
        message: `Columns updated successfully for table ${name}`,
        columns
      });
    } catch (error) {
      return res.status(500).json({ message: "Error updating columns", error: error.message });
    }
  }

  async addColumn(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const { columnName, columnType } = req.body;
      await entityClassManager.addColumn(name, columnName, columnType);
      return res.status(201).json({
        message: `Column ${columnName} added successfully to table ${name}`,
        column: { name: columnName, type: columnType }
      });
    } catch (error) {
      return res.status(500).json({ message: "Error adding column", error: error.message });
    }
  }

  async removeColumn(req: Request, res: Response) {
    try {
      const { name, columnName } = req.params;
      await entityClassManager.removeColumn(name, columnName);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Error removing column", error: error.message });
    }
  }
}