#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Recipe = require('./src/models/Recipe');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-ai');
    console.log('✅ Connected to MongoDB');
    
    // Get all users with detailed info
    const users = await User.find({}).select('-password');
    console.log(`\n📊 Total Users: ${users.length}`);
    
    console.log('\n👥 USER DETAILS:');
    console.log('='.repeat(80));
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`\n${i + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   🕒 Last Active: ${user.lastActive.toLocaleDateString()}`);
      console.log(`   🎯 Skill Level: ${user.preferences.skillLevel}`);
      console.log(`   📏 Units: ${user.preferences.measurementUnits}`);
      console.log(`   🍽️ Dietary Restrictions: ${user.preferences.dietaryRestrictions.join(', ') || 'None'}`);
      console.log(`   🔧 Equipment: ${user.equipment.length} items`);
      console.log(`   📈 AI Learning: ${user.aiLearningData.totalRecipesParsed} recipes parsed`);
      
      // Get user's recipes count
      const recipeCount = await Recipe.countDocuments({ user: user._id });
      console.log(`   📚 Recipes: ${recipeCount}`);
    }
    
    // Statistics
    console.log('\n📈 STATISTICS:');
    console.log('='.repeat(50));
    
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const newThisWeek = await User.countDocuments({ createdAt: { $gte: thisWeek } });
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth } });
    const activeUsers = await User.countDocuments({ lastActive: { $gte: thisWeek } });
    
    console.log(`🆕 New users this week: ${newThisWeek}`);
    console.log(`📅 New users this month: ${newThisMonth}`);
    console.log(`🟢 Active users (this week): ${activeUsers}`);
    
    // Skill level distribution
    const skillLevels = await User.aggregate([
      { $group: { _id: '$preferences.skillLevel', count: { $sum: 1 } } }
    ]);
    
    console.log('\n🎯 SKILL LEVEL DISTRIBUTION:');
    skillLevels.forEach(level => {
      console.log(`   ${level._id}: ${level.count} users`);
    });
    
    // Equipment usage
    const totalEquipment = await User.aggregate([
      { $unwind: '$equipment' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    
    console.log(`\n🔧 Total equipment items across all users: ${totalEquipment[0]?.count || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Command line options
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔍 Recipe AI User Checker

Usage: node check-users.js [options]

Options:
  --help, -h     Show this help message
  --simple       Show only basic user info
  --stats        Show only statistics
  --active       Show only active users

Examples:
  node check-users.js
  node check-users.js --simple
  node check-users.js --stats
`);
  process.exit(0);
}

if (args.includes('--simple')) {
  // Simple version - just names and emails
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-ai')
    .then(async () => {
      const users = await User.find({}).select('name email createdAt');
      console.log('👥 Users:');
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name} (${user.email}) - ${user.createdAt.toLocaleDateString()}`);
      });
      process.exit(0);
    });
} else if (args.includes('--stats')) {
  // Stats only
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe-ai')
    .then(async () => {
      const total = await User.countDocuments();
      const thisWeek = await User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      });
      console.log(`📊 Total Users: ${total}`);
      console.log(`🆕 New This Week: ${thisWeek}`);
      process.exit(0);
    });
} else {
  // Full report
  checkUsers();
}
