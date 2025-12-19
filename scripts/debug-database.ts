#!/usr/bin/env tsx
/**
 * Database Debug Script
 * Checks database connection and queries user 'bisoye'
 */

import 'dotenv/config';

import { db } from '../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function debugDatabase() {
    console.log('\n🔍 Database Debug Tool\n');
    console.log('='.repeat(60));

    // Check environment
    console.log('\n📋 Environment Check:');
    if (process.env.DATABASE_URL) {
        const dbUrl = process.env.DATABASE_URL;
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@'); // Mask password
        console.log(`✅ DATABASE_URL: ${maskedUrl}`);
    } else {
        console.log('❌ DATABASE_URL not set!');
        console.log('   Please check your .env file');
        process.exit(1);
    }

    // Test database connection
    console.log('\n🔌 Testing Database Connection...');
    try {
        await db.select().from(users).limit(1);
        console.log('✅ Database connection successful!');
    } catch (error: any) {
        console.log(`❌ Database connection failed: ${error.message}`);
        process.exit(1);
    }

    // Check for user 'bisoye'
    console.log('\n👤 Checking User: bisoye');
    try {
        const [user] = await db
            .select({
                id: users.id,
                username: users.username,
                role: users.role,
                roleId: users.roleId,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                organizationId: users.organizationId,
                isActive: users.isActive,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.username, 'bisoye'))
            .limit(1);

        if (user) {
            console.log('\n✅ User Found:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Role ID: ${user.roleId || 'None'}`);
            console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`);
            console.log(`   Email: ${user.email || 'Not set'}`);
            console.log(`   Organization ID: ${user.organizationId || 'None'}`);
            console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log(`   Updated: ${user.updatedAt}`);

            if (user.role === 'user') {
                console.log('\n⚠️  WARNING: User has "user" role (limited permissions)');
                console.log('   To update, run: npx tsx scripts/update-bisoye-role.ts admin');
            }
        } else {
            console.log('\n❌ User "bisoye" not found in database!');
        }

        // List all users
        console.log('\n📊 All Users in Database:');
        const allUsers = await db
            .select({
                id: users.id,
                username: users.username,
                role: users.role,
                firstName: users.firstName,
                lastName: users.lastName,
            })
            .from(users)
            .limit(20);

        if (allUsers.length > 0) {
            console.log(`\n   Found ${allUsers.length} user(s):`);
            allUsers.forEach(u => {
                const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A';
                console.log(`   - ${u.username} (${u.role}) - ${name}`);
            });
        } else {
            console.log('   No users found');
        }

    } catch (error: any) {
        console.log(`❌ Error querying users: ${error.message}`);
        console.error(error);
        process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Database debug complete!\n');
}

debugDatabase().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});

