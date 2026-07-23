import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // ← Aggiungi questa riga PRIMA

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_EMAIL = 'test1@example.com';
const TEST_PASSWORD = 'Test123!@#';

async function getOrCreateTestUser(): Promise<string> {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (!authError) {
    console.log('✅ User created:', authData.user.id);
    return authData.user.id;
  }

  console.log('ℹ️  User already exists, reusing it.');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', TEST_EMAIL)
    .single();

  if (profileError || !profile) {
    console.error('Could not find existing test user:', profileError ?? authError);
    throw authError;
  }

  return profile.id;
}

async function seed() {
  console.log('🌱 Seeding database...');

  const userId = await getOrCreateTestUser();

  // Wipe this user's previous seed data so the script can be re-run safely.
  await supabase.from('income').delete().eq('user_id', userId);
  await supabase.from('expenses').delete().eq('user_id', userId);

  // Spans 2025 through today (2026-07) so month/quarter/year filters all have several options to try.
  const incomeData = [
    { user_id: userId, invoice_id: 'INV-101', client: 'Nimbus Studio', amount: 1200, date: '2025-02-14', status: 'paid', notes: 'Brand refresh' },
    { user_id: userId, invoice_id: 'INV-102', client: 'Acme Corp', amount: 900, date: '2025-03-22', status: 'paid', notes: 'Landing page' },
    { user_id: userId, invoice_id: 'INV-103', client: 'Blue Harbor', amount: 1800, date: '2025-05-10', status: 'paid', notes: 'E-commerce integration' },
    { user_id: userId, invoice_id: 'INV-104', client: 'TechStartup', amount: 2200, date: '2025-06-18', status: 'paid', notes: 'API development' },
    { user_id: userId, invoice_id: 'INV-105', client: 'Local Biz', amount: 650, date: '2025-08-05', status: 'paid', notes: 'Menu redesign' },
    { user_id: userId, invoice_id: 'INV-106', client: 'Nimbus Studio', amount: 1400, date: '2025-09-12', status: 'paid', notes: 'Design system' },
    { user_id: userId, invoice_id: 'INV-107', client: 'Acme Corp', amount: 1000, date: '2025-11-03', status: 'overdue', notes: 'Support retainer' },
    { user_id: userId, invoice_id: 'INV-108', client: 'Blue Harbor', amount: 2100, date: '2025-12-20', status: 'paid', notes: 'Year-end project' },
    { user_id: userId, invoice_id: 'INV-109', client: 'TechStartup', amount: 2500, date: '2026-01-15', status: 'paid', notes: 'Q1 sprint' },
    { user_id: userId, invoice_id: 'INV-110', client: 'Local Biz', amount: 700, date: '2026-02-09', status: 'paid', notes: 'Site refresh' },
    { user_id: userId, invoice_id: 'INV-111', client: 'Nimbus Studio', amount: 1600, date: '2026-03-27', status: 'pending', notes: 'Marketing site' },
    { user_id: userId, invoice_id: 'INV-112', client: 'Acme Corp', amount: 1100, date: '2026-04-14', status: 'paid', notes: 'Bug fixes' },
    { user_id: userId, invoice_id: 'INV-113', client: 'Blue Harbor', amount: 1950, date: '2026-05-19', status: 'paid', notes: 'New feature' },
    { user_id: userId, invoice_id: 'INV-114', client: 'TechStartup', amount: 2300, date: '2026-06-08', status: 'paid', notes: 'API dev' },
    { user_id: userId, invoice_id: 'INV-003', client: 'Local Biz', amount: 800, date: '2026-06-23', status: 'overdue', notes: 'Logo' },
    { user_id: userId, invoice_id: 'INV-001', client: 'Acme Corp', amount: 1500, date: '2026-07-01', status: 'paid', notes: 'Website design' },
    { user_id: userId, invoice_id: 'INV-002', client: 'TechStartup', amount: 2500, date: '2026-07-05', status: 'pending', notes: 'API dev' },
    { user_id: userId, invoice_id: 'INV-115', client: 'Nimbus Studio', amount: 1300, date: '2026-07-18', status: 'pending', notes: 'Follow-up work' },
  ];

  const { error: incomeError } = await supabase.from('income').insert(incomeData);
  if (incomeError) console.error('Income error:', incomeError);
  else console.log(`✅ ${incomeData.length} income rows seeded`);

  const expenseData = [
    { user_id: userId, description: 'Figma subscription', category: 'Software', amount: 45, date: '2025-02-05' },
    { user_id: userId, description: 'Train to client meeting', category: 'Travel', amount: 120, date: '2025-03-11' },
    { user_id: userId, description: 'Desk chair', category: 'Office', amount: 220, date: '2025-04-22' },
    { user_id: userId, description: 'GitHub Copilot', category: 'Software', amount: 19, date: '2025-06-02' },
    { user_id: userId, description: 'Coworking day pass', category: 'Other', amount: 35, date: '2025-07-15' },
    { user_id: userId, description: 'Flight to conference', category: 'Travel', amount: 380, date: '2025-09-08' },
    { user_id: userId, description: 'External monitor', category: 'Office', amount: 310, date: '2025-10-20' },
    { user_id: userId, description: 'Notion subscription', category: 'Software', amount: 96, date: '2025-12-01' },
    { user_id: userId, description: 'Client visit train', category: 'Travel', amount: 95, date: '2026-01-10' },
    { user_id: userId, description: 'Printer ink', category: 'Office', amount: 40, date: '2026-03-05' },
    { user_id: userId, description: 'Business cards', category: 'Other', amount: 60, date: '2026-04-18' },
    { user_id: userId, description: 'Taxi to client', category: 'Travel', amount: 55, date: '2026-05-09' },
    { user_id: userId, description: 'Laptop repair', category: 'Office', amount: 150, date: '2026-06-20' },
    { user_id: userId, description: 'Adobe Creative Cloud', category: 'Software', amount: 65, date: '2026-07-01' },
    { user_id: userId, description: 'Flight to client', category: 'Travel', amount: 250, date: '2026-07-10' },
    { user_id: userId, description: 'Zoom subscription', category: 'Software', amount: 15, date: '2026-07-20' },
  ];

  const { error: expenseError } = await supabase.from('expenses').insert(expenseData);
  if (expenseError) console.error('Expense error:', expenseError);
  else console.log(`✅ ${expenseData.length} expense rows seeded`);

  console.log('\n🎉 Seed complete!');
  console.log('Login with:');
  console.log(`  Email: ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
}

seed().catch(console.error);
