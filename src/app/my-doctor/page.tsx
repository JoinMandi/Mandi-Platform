import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function MyDoctorPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold">Your doctor</p>
          <h1 className="font-display text-3xl text-brown mt-1">We spend time with you</h1>
          <p className="text-brown/70 text-sm">All first appointments are 30 minutes.</p>
          <div className="bg-cream-soft rounded-3xl p-6 mt-5">
            <p className="font-display text-2xl text-brown">Dr Naledi Mokoena</p>
            <p className="text-brown/70 text-sm">GP · Cape Town · English and Afrikaans</p>
            <p className="text-brown/70 text-sm mt-3">
              Trained in menopause care. Dr Naledi has your summary and will read it before you talk.
            </p>
          </div>
          <Link href="/my-doctor/recording" className="block text-center mt-6 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Choose a time
          </Link>
        </div>
      </main>
    </>
  );
}
