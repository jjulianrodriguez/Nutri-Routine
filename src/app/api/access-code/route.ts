import { NextResponse } from "next/server";

type AccessCodePayload = {
  accessCode?: unknown;
};

export async function POST(request: Request) {
  let payload: AccessCodePayload;

  try {
    payload = (await request.json()) as AccessCodePayload;
  } catch {
    return NextResponse.json(
      { error: "Solicitud invalida." },
      { status: 400 },
    );
  }

  const accessCode =
    typeof payload.accessCode === "string" ? payload.accessCode.trim() : "";
  const expectedCode = process.env.REGISTER_ACCESS_CODE?.trim();

  if (!expectedCode) {
    return NextResponse.json(
      {
        error:
          "Configura REGISTER_ACCESS_CODE antes de permitir nuevos registros.",
      },
      { status: 500 },
    );
  }

  if (!accessCode || accessCode !== expectedCode) {
    return NextResponse.json(
      { error: "Codigo de acceso invalido." },
      { status: 403 },
    );
  }

  return NextResponse.json({ valid: true });
}
