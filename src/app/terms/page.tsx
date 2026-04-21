import path from "node:path";
import { readFile } from "node:fs/promises";
import type { Metadata } from "next";
import SitePageShell from "@/components/SitePageShell";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service | Dad Health",
  description: "Dad Health terms of service and legal terms.",
};

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

/** Strip Termly / Word export chrome; keep full text and links. Styling matches privacy page. */
const sanitizeTermsHtml = (html: string) => {
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
  out = out.replace(/\sclass="[^"]*"/gi, "");
  out = out.replace(/\sclass='[^']*'/gi, "");

  out = out.replace(/&nbsp;/gi, " ");
  out = out.replace(/\u00a0/g, " ");

  while (/<bdt[\s\S]*?<\/bdt>/i.test(out)) {
    out = out.replace(/<bdt[^>]*>([\s\S]*?)<\/bdt>/gi, "$1");
  }

  out = out.replace(/<a([^>]*)\sclass="cookie123"[^>]*>[\s\S]*?<\/a>/gi, "");
  out = out.replace(/<a([^>]*)\sname="[^"]*"[^>]*>\s*<\/a>/gi, "");
  out = out.replace(/<div>\s*<\/div>/gi, "");
  out = out.replace(/<\/?u>/gi, "");

  out = out.replace(/<strong>\s*<h1>\s*TERMS OF SERVICE\s*<\/h1>\s*<\/strong>/gi, "");
  out = out.replace(/<h1>\s*TERMS OF SERVICE\s*<\/h1>/gi, "");

  let prev = "";
  while (prev !== out) {
    prev = out;
    out = out.replace(/<div>\s*<\/div>/gi, "");
    out = out.replace(/<strong>\s*<\/strong>/gi, "");
  }

  return out.trim();
};

const getTermsBodyHtml = async () => {
  const termsPath = path.join(process.cwd(), "terms.html");
  const raw = await readFile(termsPath, "utf8");

  const stripped = raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  const bodyFromTag = stripped.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  const inner = bodyFromTag ?? extractBodyDivInner(stripped);

  const cleaned = sanitizeTermsHtml(inner);
  return wrapYesNoTableCells(cleaned);
};

const TermsPage = async () => {
  const policyHtml = await getTermsBodyHtml();

  return (
    <SitePageShell>
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <span className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase opacity-60 mb-2 block">
            DAD HEALTH LEGAL
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold uppercase leading-none tracking-wide">
              TERMS OF SERVICE
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-8 lg:py-10">
          <article
            className="max-w-none text-muted-foreground text-[15px] leading-7 [&_h1]:font-heading [&_h1]:text-[30px] [&_h1]:leading-tight [&_h1]:font-extrabold [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:!text-primary [&_h2]:font-heading [&_h2]:text-[28px] [&_h2]:leading-tight [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:!text-primary [&_h3]:font-heading [&_h3]:text-[20px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:!text-primary [&_p]:my-3 [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_table]:w-full [&_table]:min-w-[780px] [&_table]:text-sm [&_table]:border [&_table]:border-border [&_table]:rounded-sm [&_table]:overflow-hidden [&_table]:[border-collapse:collapse] [&_th]:px-4 [&_th]:py-3 [&_th]:!text-left [&_th]:font-heading [&_th]:text-[10px] [&_th]:font-extrabold [&_th]:tracking-[1.8px] [&_th]:uppercase [&_th]:!text-primary [&_th]:bg-muted/40 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:tracking-normal [&_td]:leading-7 [&_td]:normal-case [&_td]:!tracking-normal [&_td]:!leading-7 [&_td]:![letter-spacing:0px] [&_td]:![word-spacing:0px] [&_td]:![text-rendering:auto] [&_td]:[text-align:left] [&_td]:[text-justify:auto] [&_td]:[font-kerning:none] [&_td]:break-words [&_td]:whitespace-normal [&_td_*]:!tracking-normal [&_td_*]:![letter-spacing:0px] [&_td_*]:![word-spacing:0px] [&_tr]:border-b [&_tr]:border-border [&_strong]:text-foreground [&_a]:text-primary [&_a]:no-underline [&_a]:decoration-transparent [&_a]:transition-all [&_a]:duration-200 [&_a:hover]:underline [&_a:hover]:underline-offset-4 [&_a:hover]:decoration-[hsl(78,89%,65%)]"
            dangerouslySetInnerHTML={{ __html: policyHtml }}
          />
        </div>
      </section>

      <SiteFooter />
    </SitePageShell>
  );
};

export default TermsPage;
