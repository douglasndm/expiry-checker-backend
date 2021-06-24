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
import ProductCategory from './ProductCategory';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    code: string;

    @OneToMany(
        type => ProductCategory,
        productCategory => productCategory.product,
    )
    categories: Array<ProductCategory>;

    @OneToMany(() => Batch, batch => batch.product)
    batches: Array<Batch>;

    @OneToMany(type => ProductTeams, productTeams => productTeams.product)
    team: ProductTeams;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
