import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from './Category';

import { Product } from './Product';

@Entity('product_category')
class ProductCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Product, product => product.categories)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(type => Category, category => category.team)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default ProductCategory;
