import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authServices';

export const generateRegistrationOptionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    const options = await authService.generateRegistrationOptionsCustom(username);
    res.json(options);
  } catch (error) {
    next(error);
  }
};

export const verifyRegistrationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, attestationResponse } = req.body;
    await authService.verifyRegistration(username, attestationResponse);
    res.status(200).send('Registration Verified');
  } catch (error) {
    next(error);
  }
};

export const generateAuthenticationOptionsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    const options = await authService.generateAuthenticationOptionsCustom(username);
    res.json(options);
  } catch (error) {
    next(error);
  }
};

export const verifyAuthenticationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, assertionResponse } = req.body;
    await authService.verifyAuthentication(username, assertionResponse);
    res.status(200).send('Authentication Verified');
  } catch (error) {
    next(error);
  }
};

export const simpleRegisterController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    await authService.simpleRegister(username, password);
    res.status(201).send('User Registered');
  } catch (error) {
    next(error);
  }
};

export const simpleLoginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const token = await authService.simpleLogin(username, password);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
