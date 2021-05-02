import {
    Entity,
    Column,
    CreateDateColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';

import { Product } from './Product';

@Entity({ name: 'batches' })
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('timestamp')
    exp_date: Date;

    @Column('integer')
    amount: number;

    @Column('decimal')
    price: number;

    @Column('varchar')
    status: 'checked' | 'unchecked';

    @ManyToOne(() => Product, product => product.batches)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
