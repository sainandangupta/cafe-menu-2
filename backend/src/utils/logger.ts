const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[${getTimestamp()}] [INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[${getTimestamp()}] [WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[${getTimestamp()}] [ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${getTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;
