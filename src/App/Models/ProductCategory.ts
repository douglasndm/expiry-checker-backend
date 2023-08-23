import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import Category from './Category';

import Product from './Product';

@Entity('product_category')
class ProductCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Product, product => product.category)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @OneToOne(() => Category, category => category)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default ProductCategory;
