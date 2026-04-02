import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "../auth-api";

type Handler = (
  req: NextRequest,
  admin: any
) => Promise<NextResponse>;

export function withAdmin(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      const admin = requireAdminApi(req);

      return await handler(req, admin);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  };
}