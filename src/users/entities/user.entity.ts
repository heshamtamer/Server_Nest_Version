// import { Roles } from "src/utility/common/user-roles.enum";
// import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

// @Entity('users')
// export class UserEntity {
//     @PrimaryGeneratedColumn()
//     id: number;
//     @Column()
//     name: string;
//     @Column({unique:true})
//     email: string;
//     @Column({select: false})
//     password: string;
//     @Column({type: 'enum', enum: Roles,array:true, default: [Roles.ADMIN]})
//     roles: Roles[];
//     @CreateDateColumn()
//     createdAt: Timestamp;
//     @UpdateDateColumn()
//     updatedAt: Timestamp;
// }
import { Roles } from "src/utility/common/user-roles.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ default: true }) // Default to true for new users
    isFirstLogin: boolean;

    @Column({ type: 'enum', enum: Roles, array: true, default: [Roles.ADMIN] })
    roles: Roles[];

    @Column({ nullable: true })
    otp: string; // OTP field to store the generated OTP

    @Column({ type: 'timestamp', nullable: true })
    otpExpiry: Date; // Expiry date for the OTP

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
