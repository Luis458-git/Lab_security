import pg from 'pg';
import env from './env.js';
import logger from './logger.js';

const { Pool } = pg;

// Determinación de requerimiento SSL / TLS
// En Neon y entornos de producción, TLS es obligatorio.
const isProduction = env.NODE_ENV === 'production';
const isNeon = env.DATABASE_URL.includes('neon.tech');
const requiresSsl = isProduction || isNeon;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: requiresSsl
    ? {
        rejectUnauthorized: true
      }
    : false,
  // Mitigación OWASP A10:2025 - Resource Depletion y Slowloris en Base de Datos
  statement_timeout: 5000, // Límite estricto de 5 segundos por consulta
  query_timeout: 5000,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Monitoreo de eventos del Pool de conexiones
pool.on('connect', () => {
  logger.debug('Nueva conexión establecida con PostgreSQL (TLS verificado)');
});

pool.on('error', (err) => {
  logger.error({ err: err.message }, 'Error inesperado en cliente inactivo del pool de PostgreSQL');
});

/**
 * Ejecutor de consultas SQL parametrizadas
 * @param {string} text - Consulta SQL con marcadores $1, $2...
 * @param {Array} params - Parámetros seguros
 * @returns {Promise<pg.QueryResult>}
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.trace({ query: text, duration, rows: res.rowCount }, 'Consulta SQL ejecutada');
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error({ query: text, duration, error: error.message }, 'Fallo en ejecución de consulta SQL');
    throw error;
  }
};

/**
 * Función de verificación de estado y conectividad (Health Check)
 */
export const checkDbHealth = async () => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name');
    return {
      status: 'UP',
      time: result.rows[0].current_time,
      database: result.rows[0].db_name
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Fallo en health check de base de datos');
    return {
      status: 'DOWN',
      error: error.message
    };
  }
};

export default {
  pool,
  query,
  checkDbHealth
};
