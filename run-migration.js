import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration file
const migrationFile = 'migrations/001_add_pomodoro_and_priority.sql';
const sqlStatements = fs.readFileSync(migrationFile, 'utf-8')
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

console.log(`Executing ${sqlStatements.length} SQL statements...`);

// Execute each statement
let executedCount = 0;
for (const sql of sqlStatements) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(`Error executing statement: ${error.message}`);
      console.error(`SQL: ${sql}`);
    } else {
      executedCount++;
      console.log(`✓ Executed statement ${executedCount}`);
    }
  } catch (err) {
    console.error(`Fatal error: ${err.message}`);
    console.error(`SQL: ${sql}`);
    process.exit(1);
  }
}

console.log(`\n✓ Migration complete! Executed ${executedCount} statements.`);
