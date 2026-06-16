export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface TransferToastData {
  /** Header label; defaults to 'Incoming Transfer' when omitted. */
  title?: string;
  /** Omitted for self-mints (top-up), where there is no counterparty. */
  sender?: string;
  amount: string;
  symbol: string;
  iconUrl?: string | null;
  memo?: string;
}

export interface ShowToastDetail {
  message: string;
  type?: ToastType;
  duration?: number;
  transfer?: TransferToastData;
}

// Helper function to show a toast from anywhere
export function showToast(message: string, type: ToastType = 'info', duration?: number) {
  window.dispatchEvent(
    new CustomEvent<ShowToastDetail>('show-toast', {
      detail: { message, type, duration },
    })
  );
}

export function showTransferToast(transfer: TransferToastData, duration = 6000) {
  const message = `${transfer.sender} sent you ${transfer.amount} ${transfer.symbol}`;
  window.dispatchEvent(
    new CustomEvent<ShowToastDetail>('show-toast', {
      detail: { message, type: 'success', duration, transfer },
    })
  );
}

/** Toast for coins self-minted via top-up — a transfer toast without a sender. */
export function showMintToast(
  mint: { amount: string; symbol: string; iconUrl?: string | null },
  duration = 6000,
) {
  window.dispatchEvent(
    new CustomEvent<ShowToastDetail>('show-toast', {
      detail: {
        message: `Received ${mint.amount} ${mint.symbol}`,
        type: 'success',
        duration,
        transfer: { title: 'Top Up', amount: mint.amount, symbol: mint.symbol, iconUrl: mint.iconUrl },
      },
    })
  );
}
