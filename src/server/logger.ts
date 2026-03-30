type LogLevel = "info" | "warn" | "error";

function writeLog(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    metadata: metadata ?? {},
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export function logInfo(message: string, metadata?: Record<string, unknown>) {
  writeLog("info", message, metadata);
}

export function logWarn(message: string, metadata?: Record<string, unknown>) {
  writeLog("warn", message, metadata);
}

export function logError(message: string, metadata?: Record<string, unknown>) {
  writeLog("error", message, metadata);
}
