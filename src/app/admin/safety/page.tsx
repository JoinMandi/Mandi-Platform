export default function SafetyPage() {
  return (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl text-brown">Safety flags</h1>
      <p className="text-brown/70 text-sm mt-1">
        Raised by Q17 at a check-in. Call protocol pending the Mandi Doctor sign-off.
      </p>

      <div className="mt-6 bg-cream-soft rounded-3xl p-5 border border-red-300/60">
        <div className="flex items-center justify-between">
          <p className="text-brown font-semibold">P-0118</p>
          <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs">
            Q17 3 · extremely
          </span>
        </div>
        <p className="text-brown/70 text-sm mt-2">
          Raised 15 Feb 19:42 at the six-week check-in. Contact: phone yes (C5).
          Doctor: Dr B.
        </p>
        <ol className="mt-3 space-y-2 text-sm text-brown list-decimal list-inside">
          <li>She has seen the SADAG panel. Call her within [__] hours using the safety call protocol.</li>
          <li>If immediate danger: stay on the line, ask her to call SADAG 0800 567 567 or 112, and call the Mandi Doctor.</li>
          <li>With her agreement, tell her doctor so she can be seen sooner.</li>
          <li>Record what was done here only. Never in Slack, email or the pilot sheet.</li>
        </ol>
        <div className="flex flex-wrap gap-2 mt-4">
          <button className="rounded-full bg-terra text-white px-4 py-2 text-sm">I have called her</button>
          <button className="rounded-full border border-brown/20 text-brown px-4 py-2 text-sm">Could not reach her</button>
          <button className="rounded-full border border-brown/20 text-brown px-4 py-2 text-sm">Escalated to Mandi Doctor</button>
        </div>
      </div>
    </div>
  );
}
