const alerts = [
  { who: "Mandi bot · 21:14", text: "Payment received. P-0142, R149 group. Chose: see a doctor." },
  { who: "Mandi bot · next day", text: "Match overdue (48h). P-0142. Please match today." },
  { who: "Mandi bot · 8 Jan 19:00", text: "No outcome form 24h after the appointment. P-0127. Ask Dr B." },
  { who: "Mandi bot · 15 Feb 20:31", text: 'Six-week check-in: "felt listened to" 2 of 5. P-0131, Dr C. Hermi, check in.' },
];

export default function AlertsPage() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl text-brown">Alerts</h1>
      <p className="text-brown/70 text-sm mt-1">#pilot-alerts. Pilot IDs only.</p>
      <div className="mt-6 space-y-3 max-w-2xl">
        {alerts.map((a, i) => (
          <div key={i} className="bg-brown text-cream rounded-3xl p-5">
            <p className="text-golden text-xs font-semibold">{a.who}</p>
            <p className="text-sm mt-1">{a.text}</p>
          </div>
        ))}
      </div>
      <p className="text-brown/60 text-xs mt-3">
        Placeholder feed. Wire to the telemetry and alerts.
      </p>
    </div>
  );
}
