// Runs once per server instance. Used to start the in-app notification
// generator on a 5-minute interval — the pragmatic replacement for
// @nestjs/schedule's @Cron, since this app runs as a persistent Node
// process rather than serverless functions.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Guard against duplicate intervals stacking up across dev-mode hot reloads.
  const globalForCron = globalThis as unknown as { __notificationsCronStarted?: boolean };
  if (globalForCron.__notificationsCronStarted) return;
  globalForCron.__notificationsCronStarted = true;

  const { generateNotifications } = await import('./lib/services/notifications');

  const FIVE_MINUTES = 5 * 60 * 1000;
  setInterval(() => {
    generateNotifications().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to generate notifications', err);
    });
  }, FIVE_MINUTES);
}
