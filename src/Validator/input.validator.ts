import Joi from "joi";

export const signUpSchemaValidator = Joi.object().keys({
  firstName: Joi.string()
    .required()
    .regex(/^[A-Za-z]+$/)
    .min(2)
    .max(30)
    .label("FirstName")
    .messages({
      "string.empty": "FirstName must not be Empty",
      "string.min": "FirstName must be min {#limit} Characters",
      "string.max": "FirstName must be min {#limit} Characters",
      "string.pattern.base": "Firstname must be alphabet Characters",
    }),
  lastName: Joi.string()
    .required()
    .regex(/^[A-Za-z\s]+$/)
    .min(2)
    .max(30)
    .label("LastName")
    .messages({
      "string.empty": "LastName must not be Empty",
      "string.min": "LastName must be min {#limit} Characters",
      "string.max": "LastName must be min {#limit} Characters",
      "string.pattern.base": "LastName must be alphabet Characters",
    }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email",
  }),
  password: Joi.string().required().min(8).max(16),
  confirmPassword: Joi.ref("password"),
});

export const loginSchemaValidator = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(8).max(16),
});
