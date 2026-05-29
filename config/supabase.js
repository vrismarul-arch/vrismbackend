// backend/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: WebSocket,
    },
  }
);

export default supabase;