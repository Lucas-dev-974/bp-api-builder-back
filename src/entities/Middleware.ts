import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Route } from "./Route";

@Entity()
export class Middleware {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("text")
  code: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Route, route => route.middlewares)
  routes: Route[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}