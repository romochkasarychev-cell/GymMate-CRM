import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "Internal server error" },
    { status: 500 },
  );
}
