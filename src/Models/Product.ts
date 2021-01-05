import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Batch } from './Batch';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    code: string;

    @OneToMany(() => Batch, batch => batch.product, {
        eager: true,
    })
    batches: Array<Batch>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
