/**
 * Middleware genérico de validación con Zod (OWASP A05:2025 - Security Misconfiguration / Input Validation)
 * Valida el cuerpo (req.body), parámetros (req.params) o consultas (req.query).
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsedData = await schema.parseAsync(dataToValidate);
      // Reemplaza los datos con la versión validada y sanitizada/transformada por Zod
      req[source] = parsedData;
      next();
    } catch (error) {
      if (error.errors) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          status: 400,
          code: 'VALIDATION_ERROR',
          error: 'Error de validación en los datos proporcionados',
          issues
        });
      }

      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateParams = (schema) => validate(schema, 'params');
export const validateQuery = (schema) => validate(schema, 'query');

export default {
  validate,
  validateBody,
  validateParams,
  validateQuery
};
