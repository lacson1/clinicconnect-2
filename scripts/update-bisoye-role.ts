#!/usr/bin/env tsx
/**
 * Script to update user role for 'bisoye'
 * Usage: npx tsx scripts/update-bisoye-role.ts [role]
 * Example: npx tsx scripts/update-bisoye-role.ts admin
 */

import { db } from '../server/db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const TARGET_USERNAME = 'bisoye';
const DEFAULT_ROLE = 'admin'; // Change this to desired default role

async function updateUserRole() {
  try {
    // Get the role from command line argument or use default
    const newRole = process.argv[2] || DEFAULT_ROLE;
    
    console.log(`\n🔍 Checking user: ${TARGET_USERNAME}...`);
    
    // First, check current user data
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, TARGET_USERNAME))
      .limit(1);
    
    if (!currentUser) {
      console.error(`❌ User '${TARGET_USERNAME}' not found in database!`);
      process.exit(1);
    }
    
    console.log(`\n📋 Current User Info:`);
    console.log(`   ID: ${currentUser.id}`);
    console.log(`   Username: ${currentUser.username}`);
    console.log(`   Current Role: ${currentUser.role}`);
    console.log(`   Role ID: ${currentUser.roleId || 'None'}`);
    console.log(`   Name: ${currentUser.firstName || ''} ${currentUser.lastName || ''}`);
    console.log(`   Organization ID: ${currentUser.organizationId || 'None'}`);
    console.log(`   Active: ${currentUser.isActive ? 'Yes' : 'No'}`);
    
    // Validate role
    const validRoles = ['admin', 'superadmin', 'super_admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'physiotherapist', 'user'];
    if (!validRoles.includes(newRole.toLowerCase())) {
      console.error(`\n❌ Invalid role: ${newRole}`);
      console.log(`\nValid roles are: ${validRoles.join(', ')}`);
      process.exit(1);
    }
    
    if (currentUser.role.toLowerCase() === newRole.toLowerCase()) {
      console.log(`\n✅ User already has role '${newRole}'. No update needed.`);
      process.exit(0);
    }
    
    console.log(`\n🔄 Updating role from '${currentUser.role}' to '${newRole}'...`);
    
    // Update the user role
    const [updatedUser] = await db
      .update(users)
      .set({
        role: newRole.toLowerCase(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id))
      .returning();
    
    if (!updatedUser) {
      console.error(`\n❌ Failed to update user role!`);
      process.exit(1);
    }
    
    console.log(`\n✅ Successfully updated user role!`);
    console.log(`\n📋 Updated User Info:`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   New Role: ${updatedUser.role}`);
    console.log(`   Updated At: ${updatedUser.updatedAt}`);
    
    console.log(`\n💡 Important: User '${TARGET_USERNAME}' needs to sign out and sign back in for the changes to take effect.`);
    console.log(`\n✨ Done!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error updating user role:`, error);
    process.exit(1);
  }
}

// Run the script
updateUserRole();

