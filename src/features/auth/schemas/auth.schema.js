import * as Yup from 'yup';
import { commonValidationRules } from '../../../schemas/common.schema';

export const loginSchema = Yup.object({
  email: commonValidationRules.email,
  password: commonValidationRules.password,
});

export const registerSchema = Yup.object({
  fullName: commonValidationRules.fullName,
  email: commonValidationRules.email,
  phone: commonValidationRules.phone,
  password: commonValidationRules.password,
});

export const forgotPasswordSchema = Yup.object({
  email: commonValidationRules.email,
});
