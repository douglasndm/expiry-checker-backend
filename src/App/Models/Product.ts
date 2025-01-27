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
import Brand from './Brand';
import Category from './Category';
import Store from './Store';

@Entity({ name: 'team_products' })
export default class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    code: string | null;

    @Column('varchar')
    image: string | null;

    @OneToOne(() => Brand)
    @JoinColumn({ name: 'brand_id' })
    brand?: Brand | null;

    @OneToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category?: Category | null;

    @OneToMany(() => Batch, batch => batch.product)
    batches: Array<Batch>;

    @OneToOne(() => ProductTeams, productTeams => productTeams.product)
    team: ProductTeams;

    @ManyToOne(() => Store, store => store.products)
    @JoinColumn({ name: 'store_id' })
    store?: Store | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
