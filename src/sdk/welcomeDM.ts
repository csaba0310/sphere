import { Sphere, logger } from '@unicitylabs/sphere-sdk';

/** Internal trigger content — hidden from chat UI, detected by bot */
export const WELCOME_TRIGGER = '__sphere_welcome__';

/** Welcome DM recipients — send trigger if no existing conversation */
const WELCOME_AGENTS = ['kbbot', 'viktor'];

/** Per-agent, per-address localStorage key to skip redundant welcome checks */
function welcomeKey(chainPubkey: string, nametag: string): string {
  return `sphere_welcomed_${nametag}_${chainPubkey}`;
}

/** Send welcome trigger DM to agents with no existing conversation (fire-and-forget). */
export function sendWelcomeDM(instance: Sphere): void {
  if (!instance.identity) return;

  const { chainPubkey } = instance.identity;

  // Skip agents that already have their flag set
  const pending = WELCOME_AGENTS.filter(
    agent => !localStorage.getItem(welcomeKey(chainPubkey, agent)),
  );
  if (pending.length === 0) return;

  const delayMs = parseInt((import.meta.env.VITE_WELCOME_DELAY_MS as string | undefined) || '4000', 10);

  setTimeout(async () => {
    for (const nametag of pending) {
      try {
        const peerInfo = await instance.resolve(`@${nametag}`);
        if (!peerInfo) continue;

        const conversation = instance.communications.getConversation(peerInfo.transportPubkey);
        if (conversation.length > 0) {
          localStorage.setItem(welcomeKey(chainPubkey, nametag), '1');
          continue;
        }

        await instance.communications.sendDM(`@${nametag}`, WELCOME_TRIGGER);
        logger.debug('SphereProvider', `Welcome trigger sent to @${nametag}`);
        localStorage.setItem(welcomeKey(chainPubkey, nametag), '1');
      } catch (err) {
        logger.warn('SphereProvider', `Failed to send welcome trigger to @${nametag}`, err);
      }
    }
  }, delayMs);
}
