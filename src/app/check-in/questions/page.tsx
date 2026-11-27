"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { submitCheckin } from "@/server/actions/consultations";

const questions = [
  { key: "listened", text: "I felt listened to and taken seriously." },
  { key: "understand", text: "I understand what is happening in my body." },
  { key: "recommend", text: "Would you recommend Mandi to a friend?" },
];

export default function CheckInQuestionsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [openResponse, setOpenResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setBusy(true);
    setErr("");
    const res = await submitCheckin({ type: "4month", answers, openResponse });
    setBusy(false);
    if (res.ok) router.push("/check-in/four-months");
    else setErr(res.error);
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Three quick questions</h1>
          <p className="text-brown/70 text-sm">We ask these at every check-in. 1 is not at all, 5 is completely.</p>
          <div className="space-y-4 mt-5">
            {questions.map((q) => (
              <div key={q.key} className="bg-cream-soft rounded-3xl p-4">
                <p className="text-sm text-brown">{q.text}</p>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAnswers((a) => ({ ...a, [q.key]: v }))}
                      className={
                        answers[q.key] === v
                          ? "flex-1 text-center rounded-full bg-terra text-white py-1 text-xs"
                          : "flex-1 text-center rounded-full border border-brown/20 py-1 text-xs text-brown/70"
                      }
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <textarea
            value={openResponse}
            onChange={(e) => setOpenResponse(e.target.value)}
            className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown mt-4"
            rows={2}
            placeholder="Anything you would like to tell us, in your own words? (optional)"
          />
          {err && <p className="text-red-700 text-sm mt-3">{err}</p>}
          <button
            onClick={submit}
            disabled={busy}
            className="block w-full text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm disabled:opacity-50"
          >
            See my four months
          </button>
        </div>
      </main>
    </>
  );
}
