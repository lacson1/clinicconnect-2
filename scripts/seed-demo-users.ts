#!/usr/bin/env tsx
/**
 * Seed Demo Users
 * Creates demo users for development/testing
 */

import 'dotenv/config';
import { db } from '../server/db';
import { users, organizations } from '@shared/schema';
import bcrypt from 'bcrypt';

async function seedDemoUsers() {
    console.log('\n🌱 Seeding Demo Users\n');
    console.log('='.repeat(60));

    try {
        // Create a default organization if it doesn't exist
        const [existingOrg] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.name, 'Demo Clinic'))
            .limit(1);

        let orgId: number;
        if (existingOrg) {
            orgId = existingOrg.id;
            console.log(`✅ Using existing organization: ${existingOrg.name} (ID: ${orgId})`);
        } else {
            const [newOrg] = await db
                .insert(organizations)
                .values({
                    name: 'Demo Clinic',
                    type: 'clinic',
                    isActive: true,
                })
                .returning();
            orgId = newOrg.id;
            console.log(`✅ Created organization: ${newOrg.name} (ID: ${orgId})`);
        }

        // Demo users to create
        const demoUsers = [
            {
                username: 'superadmin',
                password: 'super123',
                role: 'superadmin',
                firstName: 'Super',
                lastName: 'Admin',
                email: 'superadmin@demo.clinic',
                title: 'Mr.',
            },
            {
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@demo.clinic',
                title: 'Mr.',
            },
            {
                username: 'ade',
                password: 'doctor123',
                role: 'doctor',
                firstName: 'Ade',
                lastName: 'Doctor',
                email: 'ade@demo.clinic',
                title: 'Dr.',
            },
            {
                username: 'syb',
                password: 'nurse123',
                role: 'nurse',
                firstName: 'Syb',
                lastName: 'Nurse',
                email: 'syb@demo.clinic',
                title: 'Ms.',
            },
            {
                username: 'receptionist',
                password: 'receptionist123',
                role: 'receptionist',
                firstName: 'Reception',
                lastName: 'Staff',
                email: 'receptionist@demo.clinic',
                title: 'Ms.',
            },
        ];

        console.log('\n👤 Creating demo users...\n');

        for (const userData of demoUsers) {
            // Check if user already exists
            const [existing] = await db
                .select()
                .from(users)
                .where(eq(users.username, userData.username))
                .limit(1);

            if (existing) {
                console.log(`⏭️  User "${userData.username}" already exists, skipping...`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const [user] = await db
                .insert(users)
                .values({
                    username: userData.username,
                    password: hashedPassword,
                    role: userData.role,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    title: userData.title,
                    organizationId: orgId,
                    isActive: true,
                })
                .returning();

            console.log(`✅ Created user: ${user.username} (${user.role}) - Password: ${userData.password}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Demo users seeded successfully!\n');
        console.log('You can now log in with any of these accounts:');
        console.log('  - superadmin / super123');
        console.log('  - admin / admin123');
        console.log('  - ade / doctor123');
        console.log('  - syb / nurse123');
        console.log('  - receptionist / receptionist123\n');

    } catch (error: any) {
        console.error('\n❌ Error seeding users:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Import eq for the query
import { eq } from 'drizzle-orm';

seedDemoUsers().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
