import { PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Entity } from "typeorm";
import { ApisConfigs } from "./ApisConfigs";

@Entity()
export class Apis {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => ApisConfigs, config => config.api, { nullable: true })
    configs: ApisConfigs[] | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 