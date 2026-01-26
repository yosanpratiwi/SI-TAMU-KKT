const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
});

const formatPhoneForFonnte = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  else if (cleaned.startsWith("8")) cleaned = "62" + cleaned;
  return cleaned;
};

async function getJsonKV(kv, key, fallback) {
  const raw = await kv.get(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

async function putJsonKV(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

export default {
  async fetch(request, env) {
    const origin = env.FRONTEND_ORIGIN || "*";

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return new Response("SECUREGATE BACKEND ONLINE", { status: 200, headers: corsHeaders(origin) });
    }

    // Init default users (sekali kalau belum ada)
    const existingUsers = await env.USERS_KV.get("users");
    if (!existingUsers) {
      const defaultUsers = [
        { id: "1", username: "admin", password: "123", name: "Administrator IT", role: "ADMIN" },
        { id: "2", username: "sekuriti", password: "123", name: "Petugas Jaga Lobi", role: "SECURITY" },
      ];
      await putJsonKV(env.USERS_KV, "users", defaultUsers);
    }

    // POST /api/login
    if (request.method === "POST" && url.pathname === "/api/login") {
      const { username, password } = await request.json();
      const users = await getJsonKV(env.USERS_KV, "users", []);
      const user = users.find((u) => u.username === username && u.password === password);

      if (!user) {
        return json({ success: false, message: "Username atau Password salah!" }, 401, corsHeaders(origin));
      }

      return json(
        { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } },
        200,
        corsHeaders(origin)
      );
    }

    // GET /api/guests
    if (request.method === "GET" && url.pathname === "/api/guests") {
      const guests = await getJsonKV(env.GUESTS_KV, "guests", []);
      return json(guests, 200, corsHeaders(origin));
    }

    // POST /api/guests
    if (request.method === "POST" && url.pathname === "/api/guests") {
      const newGuest = await request.json();
      const { waPayload, ...guestData } = newGuest;

      const guests = await getJsonKV(env.GUESTS_KV, "guests", []);
      guests.unshift(guestData);
      await putJsonKV(env.GUESTS_KV, "guests", guests);

      let waStatus = false;
      let waResult = { message: "Pending" };

      if (waPayload?.target) {
        if (!env.WHATSAPP_API_TOKEN) {
          waResult = { message: "WHATSAPP_API_TOKEN belum diset." };
        } else {
          const cleanedTarget = formatPhoneForFonnte(waPayload.target);
          try {
            const resp = await fetch("https://api.fonnte.com/send", {
              method: "POST",
              headers: {
                Authorization: env.WHATSAPP_API_TOKEN,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                target: cleanedTarget,
                message: waPayload.message,
                countryCode: "62",
                delay: "2",
              }),
            });
            waResult = await resp.json();
            waStatus = waResult.status === true;
          } catch (e) {
            waResult = { message: e.message };
          }
        }
      }

      return json(
        {
          success: true,
          guest: guestData,
          waStatus,
          backupMessage: waPayload ? waPayload.message : "",
          targetPhone: waPayload ? waPayload.target : "",
          waResult,
        },
        200,
        corsHeaders(origin)
      );
    }

    // PUT /api/guests/:id
    if (request.method === "PUT" && url.pathname.startsWith("/api/guests/")) {
      const id = url.pathname.split("/").pop();
      const updateData = await request.json();

      const guests = await getJsonKV(env.GUESTS_KV, "guests", []);
      const updated = guests.map((g) => (g.id === id ? { ...g, ...updateData } : g));
      await putJsonKV(env.GUESTS_KV, "guests", updated);

      return json({ success: true }, 200, corsHeaders(origin));
    }

    return json({ success: false, message: "Not found" }, 404, corsHeaders(origin));
  },
};
