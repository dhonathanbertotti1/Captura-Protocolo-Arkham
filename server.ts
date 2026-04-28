import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Client (Optional - if variables are provided)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  let supabase: any = null;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized.");
  }

  // API Route to save lead
  app.post("/api/leads", async (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Nome e telefone são obrigatórios." });
    }

    console.log("Novo lead recebido:", { name, phone });

    // If Supabase is configured, try to save there
    if (supabase) {
      try {
        const { error } = await supabase
          .from('leads')
          .insert([{ name, phone, created_at: new Date() }]);
        
        if (error) throw error;
        return res.json({ success: true, message: "Lead salvo no Supabase." });
      } catch (err: any) {
        console.error("Erro no Supabase:", err.message);
        // Fallback to success response since we at least logged it
      }
    }

    // Default response (success even if supabase is not yet configured)
    res.json({ success: true, message: "Lead recebido com sucesso." });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
