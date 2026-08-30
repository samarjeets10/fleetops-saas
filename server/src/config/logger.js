const env = require('./env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const activeLevel = env.NODE_ENV === "production" ? LEVELS.info : LEVELS.debug;

function write(level, message, meta) {
    
    if (LEVELS[level] > activeLevel) return;

    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(meta ? { meta } : {}),
    };

    const line = JSON.stringify(entry);

    if (level === "error") console.error(line);
    else if(level === "warn") console.warn(line);
    else console.log(line);
}

module.exports = {
    error: (message, meta) => write("error", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    info: (message, meta) => write("info", message, meta),
    debug: (message, meta) => write("debug", message, meta),
}