const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users (agents)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'maria.ivanova@realestate.bg',
      passwordHash: hashedPassword,
      firstName: 'Мария',
      lastName: 'Иванова',
      role: 'agent',
      phone: '+359 888 111 222'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'petar.stoynov@realestate.bg',
      passwordHash: hashedPassword,
      firstName: 'Петър',
      lastName: 'Стойнов',
      role: 'agent',
      phone: '+359 888 333 444'
    }
  });

  console.log('✅ Users created');

  // Create sellers
  const seller1 = await prisma.seller.create({
    data: {
      firstName: 'Стефан',
      lastName: 'Георгиев',
      phone: '+359 889 111 222',
      email: 'stefan.georgiev@email.com',
      status: 'active',
      assignedAgentId: user1.id,
      notes: 'Собственик на 2 имота в центъра.'
    }
  });

  const seller2 = await prisma.seller.create({
    data: {
      firstName: 'Елена',
      lastName: 'Тодорова',
      phone: '+359 887 333 444',
      email: 'elena.todorova@email.com',
      status: 'active',
      assignedAgentId: user2.id,
      notes: 'Собственик на управляван имот и къща.'
    }
  });

  console.log('✅ Sellers created');

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      propertyType: 'sale',
      category: 'apartment',
      title: 'Тристаен апартамент в Лозенец',
      description: 'Светъл тристаен апартамент с две тераси и паркомясто.',
      address: 'ул. Фритьоф Нансен 25',
      city: 'София',
      district: 'Лозенец',
      area: 95,
      rooms: 3,
      floor: 4,
      totalFloors: 6,
      yearBuilt: 2010,
      exposure: 'Юг/Изток',
      heating: 'Централно парно',
      priceEur: 165000,
      pricePerSqm: 1737,
      status: 'available',
      viewings: 8,
      lastViewing: new Date('2024-12-05'),
      sellerId: seller1.id,
      assignedAgentId: user1.id
    }
  });

  const property2 = await prisma.property.create({
    data: {
      propertyType: 'rent',
      category: 'apartment',
      title: 'Двустаен под наем в Студентски град',
      description: 'Обзаведен двустаен апартамент до НБУ.',
      address: 'бул. Климент Охридски 87',
      city: 'София',
      district: 'Студентски град',
      area: 65,
      rooms: 2,
      floor: 2,
      totalFloors: 5,
      yearBuilt: 1985,
      exposure: 'Запад',
      heating: 'Климатици',
      monthlyRentEur: 600,
      rentalConditions: 'Депозит 1 месец, без домашни любимци',
      status: 'rented',
      viewings: 12,
      lastViewing: new Date('2024-11-30'),
      sellerId: seller1.id,
      assignedAgentId: user1.id
    }
  });

  const property3 = await prisma.property.create({
    data: {
      propertyType: 'managed',
      category: 'apartment',
      title: 'Едностаен - управляван имот',
      description: 'Малък апартамент в сърцето на София.',
      address: 'ул. Васил Левски 45',
      city: 'София',
      district: 'Център',
      area: 45,
      rooms: 1,
      floor: 3,
      totalFloors: 4,
      yearBuilt: 1960,
      exposure: 'Север',
      heating: 'Електрическо',
      monthlyRentEur: 450,
      managementFeePercent: 8,
      status: 'managed',
      viewings: 5,
      sellerId: seller2.id,
      assignedAgentId: user2.id
    }
  });

  const property4 = await prisma.property.create({
    data: {
      propertyType: 'sale',
      category: 'house',
      title: 'Къща в Бояна',
      description: 'Красива къща с двор 400кв.м.',
      address: 'ул. Акад. Борис Стефанов 15',
      city: 'София',
      district: 'Бояна',
      area: 180,
      rooms: 4,
      floor: 1,
      totalFloors: 2,
      yearBuilt: 2005,
      exposure: 'Юг',
      heating: 'Газово',
      priceEur: 280000,
      pricePerSqm: 1556,
      status: 'available',
      viewings: 15,
      lastViewing: new Date('2024-12-06'),
      sellerId: seller2.id,
      assignedAgentId: user2.id
    }
  });

  console.log('✅ Properties created');

  // Create buyers
  const buyer1 = await prisma.buyer.create({
    data: {
      firstName: 'Георги',
      lastName: 'Петров',
      phone: '+359 888 123 456',
      email: 'georgi.petrov@email.com',
      budgetMin: 80000,
      budgetMax: 120000,
      preferredLocation: 'Витоша, София',
      propertyType: 'apartment',
      roomsMin: 2,
      roomsMax: 3,
      status: 'active',
      source: 'website',
      assignedAgentId: user1.id,
      notes: 'Търси апартамент с тераса. Предпочита южно изложение.'
    }
  });

  const buyer2 = await prisma.buyer.create({
    data: {
      firstName: 'Анна',
      lastName: 'Димитрова',
      phone: '+359 887 654 321',
      email: 'anna.dimitrova@gmail.com',
      budgetMin: 150000,
      budgetMax: 200000,
      preferredLocation: 'Лозенец, София',
      propertyType: 'house',
      roomsMin: 3,
      roomsMax: 4,
      status: 'active',
      source: 'referral',
      assignedAgentId: user2.id,
      notes: 'Търси къща с двор за кучето си.'
    }
  });

  const buyer3 = await prisma.buyer.create({
    data: {
      firstName: 'Иван',
      lastName: 'Николов',
      phone: '+359 888 999 777',
      email: 'ivan.nikolov@company.com',
      budgetMin: 60000,
      budgetMax: 90000,
      preferredLocation: 'Студентски град, София',
      propertyType: 'apartment',
      roomsMin: 1,
      roomsMax: 2,
      status: 'converted',
      source: 'advertisement',
      assignedAgentId: user1.id,
      notes: 'Купи апартамент през ноември.'
    }
  });

  const buyer4 = await prisma.buyer.create({
    data: {
      firstName: 'Мария',
      lastName: 'Стоянова',
      phone: '+359 889 444 555',
      email: 'maria.stoyanova@gmail.com',
      budgetMin: 250000,
      budgetMax: 350000,
      preferredLocation: 'Бояна, София',
      propertyType: 'house',
      roomsMin: 4,
      roomsMax: 5,
      status: 'active',
      source: 'recommendation',
      assignedAgentId: user2.id,
      notes: 'Търси луксозна къща с голям двор.'
    }
  });

  console.log('✅ Buyers created');

  // Create tenants for managed properties
  const tenant1 = await prisma.tenant.create({
    data: {
      firstName: 'Калин',
      lastName: 'Петков',
      phone: '+359 888 555 666',
      email: 'kalin.petkov@email.com',
      propertyId: property2.id,
      contractStart: new Date('2024-12-01'),
      contractEnd: new Date('2025-12-01'),
      deposit: 600,
      monthlyRent: 600,
      status: 'active'
    }
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      firstName: 'Мила',
      lastName: 'Димитрова',
      phone: '+359 887 777 888',
      email: 'mila.dimitrova@email.com',
      propertyId: property3.id,
      contractStart: new Date('2024-10-01'),
      contractEnd: new Date('2025-10-01'),
      deposit: 450,
      monthlyRent: 450,
      status: 'active'
    }
  });

  console.log('✅ Tenants created');

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Обаждане до Георги Петров',
      description: 'Последващ разговор за апартамента в Лозенец',
      dueDate: new Date('2024-12-08'),
      dueTime: new Date('1970-01-01T14:00:00Z'),
      priority: 'high',
      status: 'pending',
      taskType: 'follow_up',
      buyerId: buyer1.id,
      propertyId: property1.id,
      assignedAgentId: user1.id
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Договор за наем - подновяване',
      description: 'Подновяване на договора с Мила Димитрова',
      dueDate: new Date('2024-12-15'),
      dueTime: new Date('1970-01-01T10:00:00Z'),
      priority: 'urgent',
      status: 'pending',
      taskType: 'contract_renewal',
      propertyId: property3.id,
      assignedAgentId: user2.id
    }
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Събиране на наем',
      description: 'Месечен наем от управлявания имот',
      dueDate: new Date('2024-12-05'),
      dueTime: new Date('1970-01-01T09:00:00Z'),
      priority: 'medium',
      status: 'completed',
      taskType: 'payment_collection',
      propertyId: property3.id,
      assignedAgentId: user2.id
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Оглед с Анна Димитрова',
      description: 'Показване на къщата в Бояна',
      dueDate: new Date('2024-12-10'),
      dueTime: new Date('1970-01-01T15:30:00Z'),
      priority: 'high',
      status: 'pending',
      taskType: 'viewing',
      buyerId: buyer2.id,
      propertyId: property4.id,
      assignedAgentId: user2.id
    }
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Подготовка на документи',
      description: 'Юридически документи за продажба',
      dueDate: new Date('2024-12-12'),
      dueTime: new Date('1970-01-01T09:00:00Z'),
      priority: 'medium',
      status: 'pending',
      taskType: 'documentation',
      propertyId: property1.id,
      assignedAgentId: user1.id
    }
  });

  console.log('✅ Tasks created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Created:');
  console.log(`👥 Users: 2`);
  console.log(`🏪 Sellers: 2`);
  console.log(`🏠 Properties: 4`);
  console.log(`👤 Buyers: 4`);
  console.log(`🏡 Tenants: 2`);
  console.log(`📅 Tasks: 5`);
  console.log('\n🔐 Login credentials:');
  console.log('Email: maria.ivanova@realestate.bg');
  console.log('Password: password123');
  console.log('\nEmail: petar.stoynov@realestate.bg');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });