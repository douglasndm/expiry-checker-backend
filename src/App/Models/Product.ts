import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Batch } from './Batch';
import ProductTeams from './ProductTeams';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    code: string;

    @OneToMany(() => Batch, batch => batch.product)
    batches: Array<Batch>;

    @OneToMany(type => ProductTeams, productTeams => productTeams.product)
    team: Array<ProductTeams>;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
