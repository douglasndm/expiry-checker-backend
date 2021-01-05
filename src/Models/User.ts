import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
    @PrimaryColumn('varchar')
    firebase_uuid: string;

    @Column('varchar')
    role: 'manager' | 'supervisor' | 'repositor';

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
