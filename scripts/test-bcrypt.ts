import bcrypt from 'bcryptjs';

async function main() {
  const storedHash = '$2b$10$SMrntSvRzcR6YBZODlKETeY1RCkLi8Cd5we/v4UsEDItlD8M8K/tO';
  const match1 = await bcrypt.compare('Password123!', storedHash);
  console.log('Compare Password123! against stored hash:', match1);
  const match2 = await bcrypt.compare('password123!', storedHash);
  console.log('Compare password123! against stored hash:', match2);
  const match3 = await bcrypt.compare('admin', storedHash);
  console.log('Compare admin against stored hash:', match3);
}

main();
