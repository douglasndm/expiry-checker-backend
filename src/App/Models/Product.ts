import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import Batch from './Batch';
import ProductTeams from './ProductTeams';
import ProductCategory from './ProductCategory';
import Brand from './Brand';
import Store from './Store';

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

    @ManyToOne(() => Store, store => store.products)
    @JoinColumn({ name: 'store_id' })
    store?: Store;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
