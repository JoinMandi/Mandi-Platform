const rows = [
  { week: "14 to 20 Dec", group: "R99", saw: 118, paid: 16, h1: "13.6%" },
  { week: "14 to 20 Dec", group: "R149", saw: 121, paid: 15, h1: "12.4%" },
  { week: "21 to 27 Dec", group: "R99", saw: 96, paid: 11, h1: "11.5%" },
  { week: "21 to 27 Dec", group: "R149", saw: 103, paid: 12, h1: "11.7%" },
  { week: "28 Dec to 3 Jan", group: "R99", saw: 88, paid: 10, h1: "11.4%" },
  { week: "28 Dec to 3 Jan", group: "R149", saw: 91, paid: 11, h1: "12.1%" },
];

export default function FunnelPage() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl text-brown">Funnel and H1</h1>
      <p className="text-brown/70 text-sm mt-1">
        Paid within 30 days of first seeing the paywall, by price group. Pass 12 percent or more, fail under 5.
      </p>

      <div className="grid sm:grid-cols-4 gap-4 mt-6">
        <Stat label="Completed" value="684" note="towards 800 to 1,000" />
        <Stat label="Saw paywall" value="540" />
        <Stat label="Paid" value="71" />
        <Stat label="Matched in 48h" value="96%" />
      </div>

      <div className="mt-8 bg-cream-soft rounded-3xl p-5 overflow-x-auto">
        <table className="w-full text-sm text-brown">
          <thead>
            <tr className="text-left text-brown/60">
              <th className="py-2">Week first saw paywall</th>
              <th>Group</th>
              <th>Saw</th>
              <th>Paid 30d</th>
              <th>H1</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-brown/10">
                <td className="py-3">{r.week}</td>
                <td>{r.group}</td>
                <td>{r.saw}</td>
                <td>{r.paid}</td>
                <td>{r.h1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-brown/60 text-xs mt-3">
        Placeholder figures. Wire to the funnel events and price assignments.
      </p>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-cream-soft rounded-3xl p-5">
      <p className="text-brown/60 text-xs uppercase tracking-wide">{label}</p>
      <p className="font-display text-3xl text-brown">{value}</p>
      {note && <p className="text-brown/50 text-xs">{note}</p>}
    </div>
  );
}
