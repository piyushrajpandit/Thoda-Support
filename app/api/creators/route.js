import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/User";

export const GET = async () => {
  await connectDB();
  const creators = await User.find({}, 'username name profilepic');
  return NextResponse.json({ creators });
};