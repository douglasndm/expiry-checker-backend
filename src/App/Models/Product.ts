import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import Batch from './Batch';
import ProductTeams from './ProductTeams';
import ProductCategory from './ProductCategory';
import Brand from './Brand';

@Entity({ name: 'products' })
export default class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    code: string | null;

    @OneToOne(() => Brand)
    @JoinColumn({ name: 'brand_id' })
    brand?: Brand | null;

    @OneToMany(
        () => ProductCategory,
        productCategory => productCategory.product,
    )
    categories: Array<ProductCategory>;

    @OneToMany(() => Batch, batch => batch.product)
    batches: Array<Batch>;

    @OneToMany(() => ProductTeams, productTeams => productTeams.product)
    team: ProductTeams;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
