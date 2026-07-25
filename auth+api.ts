
import { ExpoResponse } from 'expo-router/server';
import connectToDatabase from '../../src/lib/db';
import { User } from '../../src/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-dev-only';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, email, password, name } = body;

        await connectToDatabase();

        if (action === 'register') {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return Response.json({ error: 'User already exists' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                email,
                password: hashedPassword,
                name
            });

            const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
            return Response.json({ token, user: { id: user._id, email: user.email, name: user.name } });
        }

        else if (action === 'login') {
            const user = await User.findOne({ email });
            if (!user) {
                return Response.json({ error: 'Invalid credentials' }, { status: 400 });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return Response.json({ error: 'Invalid credentials' }, { status: 400 });
            }

            const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
            return Response.json({ token, user: { id: user._id, email: user.email, name: user.name } });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Auth API Error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
