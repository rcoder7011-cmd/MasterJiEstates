import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { connectDatabase, closeDatabaseConnection, isDatabaseConnected } from '../config/database.js';
import User from '../models/User.js';
import { isPasswordStrong } from '../validators/authValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

/**
 * Parse command line arguments in --key=value or --flag format.
 */
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, ...values] = arg.slice(2).split('=');
      args[key] = values.length > 0 ? values.join('=') : true;
    }
  });
  return args;
}

async function seedAdmin() {
  console.log('========================================================');
  console.log(' MasterJiEstates — Secure Admin Account Provisioning');
  console.log('========================================================\n');

  const args = parseArgs();

  const secretKey = args.secretKey || process.env.ADMIN_SEED_SECRET_KEY;
  const email = args.email || process.env.ADMIN_EMAIL;
  const name = args.name || process.env.ADMIN_NAME || 'MasterJi Administrator';
  const phone = args.phone || process.env.ADMIN_PHONE || '9876543210';
  const password = args.password || process.env.ADMIN_PASSWORD;
  const force = Boolean(args.force);

  // Security Verification 1: Require Server Master Key
  if (!secretKey) {
    console.error('Error: Master admin provisioning key is required.');
    console.error('Provide --secretKey="<key>" or configure ADMIN_SEED_SECRET_KEY in server/.env.\n');
    process.exit(1);
  }

  const expectedSecretKey = process.env.ADMIN_SEED_SECRET_KEY;
  if (!expectedSecretKey || secretKey !== expectedSecretKey) {
    console.error('Error: Master key does not match ADMIN_SEED_SECRET_KEY configured in server/.env.\n');
    process.exit(1);
  }

  // Security Verification 2: Require Explicit Credentials (No Default Hardcoded Passwords)
  if (!email || !password) {
    console.error('Error: Admin email and password are required.');
    console.error('Usage: node scripts/seedAdmin.js --email="admin@masterjiestates.in" --password="<strongPassword>" --secretKey="<masterKey>"\n');
    process.exit(1);
  }

  // Security Verification 3: Password Strength Policy
  if (!isPasswordStrong(password)) {
    console.error('Error: Password does not meet security complexity requirements.');
    console.error('Must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.\n');
    process.exit(1);
  }

  // Security Verification 4: Database Readiness
  console.log('Connecting to database...');
  const connected = await connectDatabase();
  if (!connected || !isDatabaseConnected()) {
    console.error('\nError: Database connection is unavailable. Admin provisioning refused without active database.\n');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Security Verification 5: Accidental Overwrite Protection
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    if (!force) {
      console.warn(`\nWarning: An account already exists for "${normalizedEmail}".`);
      console.warn('To update or overwrite this existing account, supply the --force flag.\n');
      await closeDatabaseConnection();
      process.exit(1);
    }

    console.log(`Updating existing account "${normalizedEmail}" to administrator...`);
    const passwordHash = await bcrypt.hash(password, 12);
    existingUser.fullName = name.trim();
    existingUser.phone = phone.replace(/[\s-]/g, '');
    existingUser.passwordHash = passwordHash;
    existingUser.role = 'admin';
    existingUser.accountStatus = 'active';
    existingUser.isEmailVerified = true;
    existingUser.isPhoneVerified = true;
    existingUser.incrementTokenVersion(); // Invalidate any previous sessions
    await existingUser.save();

    console.log('\n--------------------------------------------------------');
    console.log(`[SUCCESS] Admin account "${normalizedEmail}" successfully updated.`);
    console.log('Role: admin | Status: active | Verified: true');
    console.log('--------------------------------------------------------\n');
  } else {
    console.log(`Provisioning new administrator "${normalizedEmail}"...`);
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      fullName: name.trim(),
      email: normalizedEmail,
      phone: phone.replace(/[\s-]/g, ''),
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
      isEmailVerified: true,
      isPhoneVerified: true,
      tokenVersion: 0,
    });

    console.log('\n--------------------------------------------------------');
    console.log(`[SUCCESS] Admin account "${normalizedEmail}" created successfully.`);
    console.log('Role: admin | Status: active | Verified: true');
    console.log('--------------------------------------------------------\n');
  }

  await closeDatabaseConnection();
  process.exit(0);
}

seedAdmin().catch(async (err) => {
  console.error('Admin provisioning unexpected error:', err.message);
  await closeDatabaseConnection();
  process.exit(1);
});

