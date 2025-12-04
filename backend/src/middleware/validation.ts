import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

export const formatValidationErrors = (errors: ValidationError[]) => {
  const result: Record<string, string[]> = {};

  const traverse = (err: ValidationError, parentPath = '') => {
    const propertyPath = parentPath ? `${parentPath}.${err.property}` : err.property;

    if (err.constraints) {
      result[propertyPath] = Object.values(err.constraints);
    }

    if (err.children && err.children.length > 0) {
      err.children.forEach((child) => traverse(child, propertyPath));
    }
  };

  errors.forEach((err) => traverse(err));

  return result;
};

export const validateBody = <T extends object>(dtoClass: ClassConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.body);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: formatValidationErrors(errors),
      });
    }

    req.body = instance;
    return next();
  };
};


