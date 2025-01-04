import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
class ProductDetails {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar')
    name: string;

    @Column('varchar')
    code: string;

    @Column()
    brand?: string;

    @Column({ name: 'thumbnail', type: 'varchar', nullable: true })
    thumbnail: string | null;

    @Column({ name: 'last_time_checked', type: 'timestamp' })
    lastTimeChecked: Date | null;

    @Column({ name: 'data_from', type: 'varchar' })
    dataFrom?: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default ProductDetails;
