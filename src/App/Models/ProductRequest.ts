import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products_request' })
class ProductRequest {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('varchar')
    code: string;

    @Column('int')
    rank: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default ProductRequest;
