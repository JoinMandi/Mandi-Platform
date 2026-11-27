const queue = [
  { id: "P-0142", paid: "16 Dec 21:14", wait: "27h", lang: "Afrikaans", group: "R149" },
  { id: "P-0143", paid: "17 Dec 08:02", wait: "16h", lang: "English", group: "R99" },
];

export default function MatchingPage() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl text-brown">Matching</h1>
      <p className="text-brown/70 text-sm mt-1">
        Hermi, daily. Target 95 percent matched within 48 hours.
      </p>

      <div className="mt-6 bg-cream-soft rounded-3xl p-5 overflow-x-auto">
        <table className="w-full text-sm text-brown">
          <thead>
            <tr className="text-left text-brown/60">
              <th className="py-2">Pilot</th>
              <th>Paid</th>
              <th>Waiting</th>
              <th>Language</th>
              <th>Group</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {queue.map((q) => (
              <tr key={q.id} className="border-t border-brown/10">
                <td className="py-3 font-medium">{q.id}</td>
                <td>{q.paid}</td>
                <td>{q.wait}</td>
                <td>{q.lang}</td>
                <td>{q.group}</td>
                <td className="text-right">
                  <span className="rounded-full bg-terra text-white px-4 py-1 text-xs">
                    Match
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-brown/60 text-xs mt-3">
        Choosing a doctor sends the meet-your-doctor email. If she changes doctor,
        she is asked again before anything is shared (C3).
      </p>
    </div>
  );
}
