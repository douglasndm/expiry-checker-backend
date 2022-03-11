import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'apps_version' })
export default class User {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'app_package' })
    appPackage: string;

    @Column({ name: 'latest_android_version' })
    latestAndroidVersion?: number;

    @Column('varchar', { name: 'latest_ios_version' })
    latestIOSVersion?: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
