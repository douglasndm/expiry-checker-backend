import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import Product from './Product';
import Team from './Team';

@Entity('product_teams')
class ProductTeams {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Product, product => product.team)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(type => Team, team => team.users)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default ProductTeams;
