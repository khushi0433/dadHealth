import path from "node:path";
import { readFile } from "node:fs/promises";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";

const cleanTdInner = (html: string) =>
  html
    .replace(/<span[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<bdt[^>]*>/gi, "")
    .replace(/<\/bdt>/gi, "")
    .replace(/style="[^"]*"/gi, "")
    .replace(/style='[^']*'/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const cellPlainText = (html: string) =>
  html
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const wrapYesNoTableCells = (html: string) =>
  html.replace(/<td([^>]*)>([\s\S]*?)<\/td>/gi, (match, attrs: string, inner: string) => {
    const cleanedInner = cleanTdInner(inner);
    const text = cellPlainText(inner).toUpperCase();

    if (text === "YES" || text === "NO") {
      const cls = text === "YES" ? "text-primary" : "text-white/90";
      return `<td${attrs}><span class="${cls} font-heading font-bold">${text}</span></td>`;
    }

    return `<td${attrs}>${cleanedInner}</td>`;
  });

const extractBodyDivInner = (html: string) => {
  const marker = '<div data-custom-class="body">';
  const start = html.indexOf(marker);
  if (start === -1) return html;

  let i = start + marker.length;
  let depth = 1;
  const lower = html.toLowerCase();

  while (i < html.length && depth > 0) {
    const nextOpen = lower.indexOf("<div", i);
    const nextClose = lower.indexOf("</div>", i);
    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(start + marker.length, nextClose);
      }
      i = nextClose + 6;
    }
  }

  return html.slice(start + marker.length);
};

/** Strip Termly export chrome; keep text/links structure. Styling comes from the article classes (same as privacy). */
const sanitizeImportedPolicyHtml = (html: string) => {
  let out = html;

  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");

  out = out.replace(/\sstyle="[^"]*"/gi, "");
  out = out.replace(/\sstyle='[^']*'/gi, "");
  out = out.replace(/\salign="[^"]*"/gi, "");
  out = out.replace(/\salign='[^']*'/gi, "");
  out = out.replace(/\sdata-custom-class="[^"]*"/gi, "");
  out = out.replace(/\sdata-custom-class='[^']*'/gi, "");
  out = out.replace(/\sid="[^"]*"/gi, "");

  out = out.replace(/&nbsp;/gi, " ");
  out = out.replace(/\u00a0/g, " ");

  while (/<bdt[\s\S]*?<\/bdt>/i.test(out)) {
    out = out.replace(/<bdt[^>]*>([\s\S]*?)<\/bdt>/gi, "$1");
  }

  out = out.replace(/<a([^>]*)\sclass="cookie123"[^>]*>[\s\S]*?<\/a>/gi, "");
  out = out.replace(/<div>\s*<\/div>/gi, "");
  out = out.replace(/<\/?u>/gi, "");

  out = out.replace(
    /<div>\s*<strong>[\s\S]*?<h1>\s*COOKIE POLICY\s*<\/h1>[\s\S]*?<\/strong>\s*<\/div>/i,
    ""
  );

  return out.trim();
};

const FALLBACK_COOKIES_HTML = `
  <div>
    <p>Our cookie policy content is temporarily unavailable.</p>
    <p>Please contact support for the latest version of this policy.</p>
  </div>
`;

const getCookiesBodyHtml = async () => {
  const cookiesPath = path.join(process.cwd(), "public/terms_files/cookies.html")
  let raw: string;
  try {
    raw = await readFile(cookiesPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return FALLBACK_COOKIES_HTML.trim();
    }
    throw error;
  }

  const stripped = raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  const bodyFromTag = stripped.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  const inner = bodyFromTag ?? extractBodyDivInner(stripped);

  const cleaned = sanitizeImportedPolicyHtml(inner);
  return wrapYesNoTableCells(cleaned);
};

const CookiesPage = async () => {
  const policyHtml = await getCookiesBodyHtml();

  return (
    <SitePageShell>
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <span className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase opacity-60 mb-2 block">
            DAD HEALTH LEGAL
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold uppercase leading-none tracking-wide">
              COOKIE POLICY
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-8 lg:py-10">
          <article
            className="cookie-policy-content max-w-none text-muted-foreground text-[15px] leading-7 [&_table]:text-sm [&_h1]:font-heading [&_h1]:text-[30px] [&_h1]:leading-tight [&_h1]:font-extrabold [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:!text-primary [&_h2]:font-heading [&_h2]:text-[28px] [&_h2]:leading-tight [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:!text-primary [&_h3]:font-heading [&_h3]:text-[20px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:!text-primary [&_p]:my-3 [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:text-foreground [&_a]:text-primary [&_a]:no-underline [&_a]:decoration-transparent [&_a]:transition-all [&_a]:duration-200 [&_a:hover]:underline [&_a:hover]:underline-offset-4 [&_a:hover]:decoration-[hsl(78,89%,65%)]"
            dangerouslySetInnerHTML={{ __html: policyHtml }}
          />
        </div>
      </section>

      <SiteFooter />
    </SitePageShell>
  );
};

export default CookiesPage;
