import { NextResponse } from "next/server";
import { logoutUrl } from "@/server/auth/cognito";
import { getSession } from "@/server/auth/session";

async function signOut(req: Request) {
  const session = await getSession();
  session.destroy();
  try {
    return NextResponse.redirect(logoutUrl());
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export async function GET(req: Request) {
  return signOut(req);
}

export async function POST(req: Request) {
  return signOut(req);
}
