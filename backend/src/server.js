import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import { pool } from './config/db.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info({
    port: PORT,
    environment: env.NODE_ENV,
    tlsConfigured: env.NODE_ENV === 'production' || env.DATABASE_URL.includes('neon.tech')
  }, `🚀 SecureVault Backend iniciado de forma segura en el puerto ${PORT}`);
});

// Configuración de timeouts contra ataques Slowloris y DoS de red (A10)
server.headersTimeout = 60000; // 60 segundos
server.keepAliveTimeout = 65000; // 65 segundos

// Cierre ordenado (Graceful Shutdown)
const gracefulShutdown = async (signal) => {
  logger.info({ signal }, 'Iniciando proceso de apagado ordenado del servidor...');

  server.close(async () => {
    logger.info('Servidor HTTP cerrado. Liberando pool de conexiones de base de datos...');
    try {
      await pool.end();
      logger.info('Pool de conexiones de base de datos cerrado con éxito');
      process.exit(0);
    } catch (err) {
      logger.error({ err: err.message }, 'Error al cerrar el pool de conexiones de base de datos');
      process.exit(1);
    }
  });

  // Forzar apagado si excede los 10 segundos
  setTimeout(() => {
    logger.error('Apagado forzado por tiempo límite excedido');
    process.exit(1);
  }, 10000);
};

// Captura de señales del sistema operativo
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Captura de errores no controlados para prevenir caídas silenciosas o fugas (OWASP A10)
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason }, 'Excepción no controlada detectada en Promesa (unhandledRejection)');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error.message, stack: error.stack }, 'Excepción no capturada en el proceso (uncaughtException)');
  gracefulShutdown('uncaughtException');
});
