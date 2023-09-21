import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import Product from './Product';
import Team from './Team';

@Entity('product_teams')
class ProductTeams {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Product, product => product.team, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @OneToOne(() => Team, team => team.users)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export default ProductTeams;
