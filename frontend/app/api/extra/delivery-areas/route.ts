import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      id: "karachi",
      name: "Karachi Metro",
      deliveryCharge: 200,
      estimatedTime: "24-48 Hours",
      minOrderAmount: 0,
      available: true
    }
  ]);
}

export async function POST() {
  return NextResponse.json({ message: "Admin updates disabled" }, { status: 403 });
}
