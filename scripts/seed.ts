import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // ← Aggiungi questa riga PRIMA

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Crea account test
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'test1@example.com',
    password: 'Test123!@#',
    email_confirm: true, // Conferma subito
  });

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  const userId = authData.user.id;
  console.log('✅ User created:', userId);

  // 2. Popola income
  const incomeData = [
    { user_id: userId, invoice_id: 'INV-001', client: 'Acme Corp', amount: 1500, date: '2026-07-01', status: 'paid', notes: 'Website design' },
    { user_id: userId, invoice_id: 'INV-002', client: 'TechStartup', amount: 2500, date: '2026-07-05', status: 'pending', notes: 'API dev' },
    { user_id: userId, invoice_id: 'INV-003', client: 'Local Biz', amount: 800, date: '2026-06-23', status: 'overdue', notes: 'Logo' },
  ];

  const { error: incomeError } = await supabase.from('income').insert(incomeData);
  if (incomeError) console.error('Income error:', incomeError);
  else console.log('✅ Income seeded');

  // 3. Popola expenses
  const expenseData = [
    { user_id: userId, description: 'Adobe Creative Cloud', category: 'Software', amount: 65, date: '2026-07-01' },
    { user_id: userId, description: 'Laptop repair', category: 'Office', amount: 150, date: '2026-06-20' },
    { user_id: userId, description: 'Flight to client', category: 'Travel', amount: 250, date: '2026-07-10' },
  ];

  const { error: expenseError } = await supabase.from('expenses').insert(expenseData);
  if (expenseError) console.error('Expense error:', expenseError);
  else console.log('✅ Expenses seeded');

  console.log('\n🎉 Seed complete!');
  console.log('Login with:');
  console.log('  Email: test1@example.com');
  console.log('  Password: Test123!@#');
}

seed().catch(console.error);