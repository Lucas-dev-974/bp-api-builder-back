import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Middleware } from "./Middleware";
import { Controller } from "./Controller";

@Entity()
export class Route {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  path: string;

  @Column()
  method: string; // GET, POST, PUT, DELETE

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Middleware)
  @JoinTable()
  middlewares: Middleware[];

  @ManyToMany(() => Controller)
  @JoinTable()
  controllers: Controller[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}