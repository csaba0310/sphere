interface Props {
  message?: string | null;
}

const DEFAULT_MESSAGE = "Marketplace is temporarily unavailable — we'll be back soon";

export function MaintenanceScreen({ message }: Props) {
  const text = message && message.trim() ? message : DEFAULT_MESSAGE;

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl"
        style={{
          background: 'rgba(255,111,0,0.12)',
          border: '1px solid rgba(255,111,0,0.3)',
          color: '#FFB366',
        }}
      >
        ⚠
      </div>
      <h2
        className="text-3xl sm:text-4xl tracking-tight mb-3 uppercase"
        style={{ fontFamily: "'Anton', sans-serif", color: 'var(--text-primary, #F1F5F9)' }}
      >
        Under Maintenance
      </h2>
      <p
        className="text-sm max-w-md"
        style={{ color: 'var(--text-muted, rgba(255,255,255,0.55))' }}
      >
        {text}
      </p>
    </div>
  );
}
