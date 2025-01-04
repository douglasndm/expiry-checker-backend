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
import Brand from './Brand';
import Category from './Category';
import Store from './Store';
import Team from './Team';

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

    @ManyToOne(() => Store, store => store.products)
    @JoinColumn({ name: 'store_id' })
    store?: Store | null;

    @OneToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
