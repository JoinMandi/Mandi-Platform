const rows = [
  { id: "P-0142", checkin: "6 weeks", follow: "Thu 18 Feb", blanket: "Not yet", c5: "Email, WhatsApp" },
  { id: "P-0139", checkin: "6 weeks", follow: "Wed 17 Feb", blanket: "Done", c5: "Email only" },
  { id: "P-0131", checkin: "6 weeks", follow: "Tue 16 Feb", blanket: "Not yet", c5: "None" },
  { id: "P-0127", checkin: "6 weeks", follow: "No date", blanket: "Not yet", c5: "Call" },
];

export default function CheckinsPage() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl text-brown">Check-ins due</h1>
      <p className="text-brown/70 text-sm mt-1">Week of 15 February. Keyed to each follow-up date.</p>

      <div className="mt-6 bg-cream-soft rounded-3xl p-5 overflow-x-auto">
        <table className="w-full text-sm text-brown">
          <thead>
            <tr className="text-left text-brown/60">
              <th className="py-2">Pilot</th>
              <th>Check-in</th>
              <th>Follow-up</th>
              <th>New blanket</th>
              <th>C5</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-brown/10">
                <td className="py-3 font-medium">{r.id}</td>
                <td>{r.checkin}</td>
                <td>{r.follow}</td>
                <td>
                  <span
                    className={
                      r.blanket === "Done"
                        ? "rounded-full bg-golden/30 text-brown px-3 py-1 text-xs"
                        : "rounded-full border border-brown/20 text-brown/60 px-3 py-1 text-xs"
                    }
                  >
                    {r.blanket}
                  </span>
                </td>
                <td>{r.c5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-brown/60 text-xs mt-3">
        No date means the doctor&rsquo;s outcome form has not come in. Ask the doctor.
      </p>
    </div>
  );
}
