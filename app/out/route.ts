const ALLOWED_MERCHANT_HOSTS = new Set(["example.com"]);

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const rawTarget = requestUrl.searchParams.get("url");
  if (!rawTarget) return new Response("Missing merchant URL", { status: 400 });
  try {
    const target = new URL(rawTarget);
    if (target.protocol !== "https:" || !ALLOWED_MERCHANT_HOSTS.has(target.hostname)) {
      return new Response("Merchant URL is not allowed", { status: 400 });
    }
    return Response.redirect(target, 302);
  } catch {
    return new Response("Invalid merchant URL", { status: 400 });
  }
}
