
import { Request, Response } from 'express';
// IMPT: Using .js extension for the Service file
import UserService from '../services/user.service.js'; 

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const {name,email,password}= req.body;
        
        const newUser = await UserService.registerUser({email,name,password});

        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
            res.status(409).json({ message: error.message }); // 409 Conflict
        } else {
            res.status(500).json({ message: "Failed to register user.", error: (error as Error).message });
        }
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users.", error: (error as Error).message });
    }
};