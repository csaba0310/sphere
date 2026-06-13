import { describe, it, expect } from 'vitest';
import {
  showToast,
  showTransferToast,
  showMintToast,
  type ShowToastDetail,
} from '../../../src/components/ui/toast-utils';

/** Capture the next `show-toast` CustomEvent dispatched on window. */
function captureToast(fire: () => void): ShowToastDetail {
  let detail: ShowToastDetail | undefined;
  const handler = (e: Event) => {
    detail = (e as CustomEvent<ShowToastDetail>).detail;
  };
  window.addEventListener('show-toast', handler);
  try {
    fire();
  } finally {
    window.removeEventListener('show-toast', handler);
  }
  if (!detail) throw new Error('show-toast event was not dispatched');
  return detail;
}

describe('showToast', () => {
  it('dispatches a plain toast with message and type', () => {
    const detail = captureToast(() => showToast('hello', 'warning', 1234));
    expect(detail).toEqual({ message: 'hello', type: 'warning', duration: 1234 });
  });
});

describe('showTransferToast', () => {
  it('dispatches a transfer toast with sender line', () => {
    const detail = captureToast(() =>
      showTransferToast({ sender: '@alice', amount: '5', symbol: 'UCT' }),
    );
    expect(detail.type).toBe('success');
    expect(detail.message).toBe('@alice sent you 5 UCT');
    expect(detail.transfer).toMatchObject({ sender: '@alice', amount: '5', symbol: 'UCT' });
  });
});

describe('showMintToast', () => {
  it('dispatches a senderless transfer toast titled "Top Up"', () => {
    const detail = captureToast(() =>
      showMintToast({ amount: '100', symbol: 'UCT', iconUrl: 'https://x/uct.png' }),
    );
    expect(detail.type).toBe('success');
    expect(detail.message).toBe('Received 100 UCT');
    expect(detail.transfer).toEqual({
      title: 'Top Up',
      amount: '100',
      symbol: 'UCT',
      iconUrl: 'https://x/uct.png',
    });
    expect(detail.transfer?.sender).toBeUndefined();
  });

  it('works without an icon', () => {
    const detail = captureToast(() => showMintToast({ amount: '0.5', symbol: 'ETH' }));
    expect(detail.message).toBe('Received 0.5 ETH');
    expect(detail.transfer).toEqual({ title: 'Top Up', amount: '0.5', symbol: 'ETH', iconUrl: undefined });
  });
});
