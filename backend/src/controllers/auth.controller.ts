import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

const SECRET_KEY = 'FinanzasDashboard2026_Key!';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validar que se envíen todos los campos requeridos
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Todos los campos son obligatorios' });
      return;
    }

    // Verificar si el usuario o correo ya existen
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      res.status(400).json({ message: 'El correo o el nombre de usuario ya están registrados' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: newUser.id });
  } catch (error) {
    console.error('Error detallado en register:', error);
    res.status(500).json({ message: 'Error en el servidor al registrar', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token
    });
  } catch (error) {
    console.error('Error detallado en login:', error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión', error });
  }
};