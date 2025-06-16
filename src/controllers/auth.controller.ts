import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.services';

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
    res.status(200).json({ message: 'User registered successfully' });
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
    const response = await authService.verifyAuthentication(username, assertionResponse);
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const simpleRegisterController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, deviceToken } = req.body;
    await authService.simpleRegister(username, password,deviceToken);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

export const simpleLoginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const { accessToken , refreshToken} = await authService.simpleLogin(username, password);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};


export const checkEmailExistsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const userExists = await authService.checkEmailExists(email);
    res.json({ userExists });
  } catch (error) {
    next(error);
  }
};