import dbConnect from "./utils/dbConnect";

export async function register() {
  console.log("Connecting to database...");
  await dbConnect();
}
