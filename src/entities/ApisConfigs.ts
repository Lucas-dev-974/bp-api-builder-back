import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Apis } from "./Apis";

@Entity("apis_configs")
export class ApisConfigs {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    model: string;

    @Column({ default: true })
    isEnable: boolean;

    @Column()
    method: string; // ex: GET, POST, PUT, DELETE

    @Column({ type: "json", nullable: true })
    config: any; // JSON de configuration (filtres, select, relations, etc.)


    @ManyToOne(() => Apis, api => api.configs, { nullable: false, onDelete: 'CASCADE' })
    api: Apis;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 