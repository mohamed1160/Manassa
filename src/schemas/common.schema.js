import * as Yup from 'yup';

/**
 * Reusable Yup validation field rules shared across feature schemas.
 */
export const commonValidationRules = {
  email: Yup.string()
    .trim()
    .email('يرجى إدخال بريد إلكتروني صحيح')
    .required('البريد الإلكتروني مطلوب'),

  password: Yup.string()
    .min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف')
    .required('كلمة المرور مطلوبة'),

  fullName: Yup.string()
    .trim()
    .min(3, 'الاسم يجب أن يتكون من 3 أحرف على الأقل')
    .required('الاسم الكامل مطلوب'),

  phone: Yup.string()
    .trim()
    .required('رقم الهاتف مطلوب'),
};
