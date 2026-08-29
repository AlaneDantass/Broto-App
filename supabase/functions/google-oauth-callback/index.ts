import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: google-oauth-callback
 *
 * Recebe o authorization code do Google OAuth 2.0, troca pelo par de tokens
 * (access_token + refresh_token), salva na tabela integracoes_google_agenda
 * e redireciona o usuário de volta para o app via deep link broto://oauth-success
 *
 * Variáveis de ambiente necessárias (configurar via: supabase secrets set):
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   SUPABASE_URL (automático no ambiente Supabase)
 *   SUPABASE_SERVICE_ROLE_KEY (automático no ambiente Supabase)
 */
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // contém o usuario_id
  const error = url.searchParams.get("error");

  // Redireciona erros de volta ao app
  if (error || !code || !state) {
    const errMsg = error || "missing_code_or_state";
    return Response.redirect(`broto://oauth-error?error=${encodeURIComponent(errMsg)}`);
  }

  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // URL desta própria Edge Function (redirect_uri registrado no Google Cloud Console)
  const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;

  try {
    // 1. Trocar authorization code por tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Erro ao trocar code por tokens:", errBody);
      return Response.redirect(`broto://oauth-error?error=${encodeURIComponent("token_exchange_failed")}`);
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // 2. Buscar e-mail da conta Google para exibição na UI
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userInfo = await userInfoRes.json();
    const emailGoogle = userInfo.email || null;

    // 3. Calcular timestamp de expiração do token
    const tokenExpiraEm = new Date(Date.now() + expires_in * 1000).toISOString();

    // 4. Salvar no banco usando service role (sem RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: dbError } = await supabase
      .from("integracoes_google_agenda")
      .upsert(
        {
          usuario_id: state, // state contém o usuario_id
          access_token,
          refresh_token,
          token_expira_em: tokenExpiraEm,
          email_google: emailGoogle,
          conectado_em: new Date().toISOString(),
          ativo: true,
        },
        { onConflict: "usuario_id" }
      );

    if (dbError) {
      console.error("Erro ao salvar tokens:", dbError);
      return Response.redirect(`broto://oauth-error?error=${encodeURIComponent("db_error")}`);
    }

    // 5. Redirecionar de volta ao app com sucesso
    return Response.redirect(`broto://oauth-success?email=${encodeURIComponent(emailGoogle || "")}`);
  } catch (err) {
    console.error("Erro inesperado no callback:", err);
    return Response.redirect(`broto://oauth-error?error=${encodeURIComponent("unexpected_error")}`);
  }
});
