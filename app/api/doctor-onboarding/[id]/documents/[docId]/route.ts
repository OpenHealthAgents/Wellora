import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { auth } from "../../../../../../lib/auth";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function getRequestHeaders() {
  try {
    return await headers();
  } catch (e) {
    return new Headers();
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id, docId } = await params;
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const practitioner = await prisma.practitioner.findUnique({
      where: { id },
    });

    if (!practitioner) {
      return new Response("Not Found", { status: 404 });
    }

    const isOwner = practitioner.userId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return new Response("Forbidden", { status: 403 });
    }

    const doc = await prisma.verificationDocument.findUnique({
      where: { id: docId },
    });

    if (!doc || doc.practitionerId !== id || !doc.fileName) {
      return new Response("Not Found", { status: 404 });
    }

    const filePath = path.join(process.cwd(), "storage", "documents", id, doc.fileName);
    if (!fs.existsSync(filePath)) {
      return new Response("File not found on storage server", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const response = new NextResponse(fileBuffer);
    
    // Set headers
    response.headers.set("Content-Type", doc.mimeType || "application/octet-stream");
    response.headers.set("Content-Disposition", `inline; filename="${doc.fileName}"`);

    return response;
  } catch (error: any) {
    console.error("Retrieve document error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
