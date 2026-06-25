

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Score = require('./models/Score');

const runTest = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        
        const databaseUri = process.env.MONGODB_URI;
        
        if (!databaseUri) {
            throw new Error('MONGODB_URI is missing from .env file!');
        }

        console.log('URI loaded: ✅ Found');
        
        await mongoose.connect(databaseUri);
        console.log('✅ Connected successfully!');

        // 1. Clean up any existing test data to start fresh
        await User.deleteMany({ email: 'testuser@example.com' });
        console.log('🧹 Cleaned up old test users.');

        // 2. Create a Fake User
        console.log('👤 Creating fake user...');
        const fakeUser = await User.create({
            username: 'testdeveloper',
            email: 'testuser@example.com',
            password: 'hashedpassword123',
            streakCount: 3
        });
        console.log(`🎉 User Created: ${fakeUser.username} (ID: ${fakeUser._id})`);

        // 3. Create a Fake AI-Generated Quiz linked to this User
        console.log('📝 Creating fake AI quiz...');
        const fakeQuiz = await Quiz.create({
            userId: fakeUser._id,
            topicTitle: 'JavaScript Async/Await',
            questions: [
                {
                    questionText: 'What does an async function return?',
                    options: ['A String', 'A Promise', 'Undefined', 'An Array'],
                    correctOptionIndex: 1
                }
            ]
        });
        console.log(`🎉 Quiz Created: "${fakeQuiz.topicTitle}" (ID: ${fakeQuiz._id})`);

        // 4. Create a Fake Score Record linked to the User and Quiz
        console.log('📊 Creating fake score history...');
        const fakeScore = await Score.create({
            userId: fakeUser._id,
            quizId: fakeQuiz._id,
            score: 1,
            totalQuestions: 1
        });
        console.log(`🎉 Score Record Created! Result: ${fakeScore.score}/${fakeScore.totalQuestions}`);

        console.log('\n🌟 SUCCESS: All schemas validated and linked perfectly in the database!');

    } catch (error) {
        console.error('\n❌ Error validating schemas:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Connection securely closed.');
        process.exit(0);
    }
};

runTest();