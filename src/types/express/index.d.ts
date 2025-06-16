import express from "express";
import { customJwtPayload } from "../constant";
declare global {
    namespace Express {
        interface Request {
            user?: customJwtPayload;
        }
    }
}