import { createApp } from "#interfaces/http/app";
import { logger } from "#infrastructure/config/logger";

const app = createApp();
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`API running on http://localhost:${PORT}`);
});
