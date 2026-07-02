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
 { error: "Solicitud inválida." },
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
 "El registro de nuevas cuentas no está disponible en este momento.",
 },
 { status: 500 },
 );
 }

 if (!accessCode || accessCode !== expectedCode) {
 return NextResponse.json(
 { error: "Código de acceso inválido." },
 { status: 403 },
 );
 }

 return NextResponse.json({ valid: true });
}
