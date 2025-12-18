#!/usr/bin/env tsx
/**
 * Script to create a referral for John Doe
 * Usage: tsx create-referral.ts
 */

import 'dotenv/config';
import { db } from './server/db';
import { patients, referrals, users } from './shared/schema';
import { eq, ilike, and } from 'drizzle-orm';

async function createReferralForJohnDoe() {
  try {
    console.log('🔍 Searching for John Doe...');
    
    // Find John Doe patient
    const johnDoePatients = await db
      .select()
      .from(patients)
      .where(
        and(
          ilike(patients.firstName, 'John%'),
          ilike(patients.lastName, 'Doe%')
        )
      )
      .limit(5);

    if (johnDoePatients.length === 0) {
      console.log('❌ John Doe not found. Creating patient first...');
      
      // Get first organization and user for context
      const [firstUser] = await db.select().from(users).limit(1);
      if (!firstUser || !firstUser.organizationId) {
        throw new Error('No users found in database. Please ensure database is seeded.');
      }

      // Create John Doe patient
      const [newPatient] = await db.insert(patients).values({
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-0100',
        organizationId: firstUser.organizationId,
        gender: 'male',
        dateOfBirth: new Date('1980-01-15')
      }).returning();

      console.log('✅ Created John Doe patient:', newPatient.id);
      
      // Create referral
      const [referral] = await db.insert(referrals).values({
        patientId: newPatient.id,
        fromUserId: firstUser.id,
        toRole: 'specialist',
        reason: 'General consultation referral',
        status: 'pending'
      }).returning();

      console.log('✅ Referral created successfully!');
      console.log('📋 Referral Details:');
      console.log('   ID:', referral.id);
      console.log('   Patient:', newPatient.firstName, newPatient.lastName);
      console.log('   Reason:', referral.reason);
      console.log('   Status:', referral.status);
      console.log('   To Role:', referral.toRole);
      
      return referral;
    }

    // Use first John Doe found
    const johnDoe = johnDoePatients[0];
    console.log('✅ Found John Doe (Patient ID:', johnDoe.id + ')');

    // Get a user to create referral from
    const [referringUser] = await db
      .select()
      .from(users)
      .where(eq(users.organizationId, johnDoe.organizationId))
      .limit(1);

    if (!referringUser) {
      throw new Error('No users found in the same organization as John Doe');
    }

    // Create referral
    const [referral] = await db.insert(referrals).values({
      patientId: johnDoe.id,
      fromUserId: referringUser.id,
      toRole: 'specialist',
      reason: 'General consultation referral - Patient requires specialist evaluation',
      status: 'pending'
    }).returning();

    console.log('✅ Referral created successfully!');
    console.log('📋 Referral Details:');
    console.log('   ID:', referral.id);
    console.log('   Patient:', johnDoe.firstName, johnDoe.lastName, '(ID:', johnDoe.id + ')');
    console.log('   Referring User:', referringUser.username, '(ID:', referringUser.id + ')');
    console.log('   Reason:', referral.reason);
    console.log('   Status:', referral.status);
    console.log('   To Role:', referral.toRole);
    console.log('   Date:', referral.date);

    return referral;
  } catch (error) {
    console.error('❌ Error creating referral:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createReferralForJohnDoe();

