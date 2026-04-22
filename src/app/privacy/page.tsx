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

const fillMissingSensitiveInfoDescription = (html: string) =>
  html.replace(
    /(<tr[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?Sensitive personal Information[\s\S]*?<\/td>\s*<td[^>]*>)([\s\S]*?)(<\/td>)/gi,
    (_match, before: string, middle: string, after: string) => {
      const text = middle.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim();
      if (text.length > 0) return `${before}${middle}${after}`;
      return `${before}No sensitive personal information collected.${after}`;
    }
  );

const getPolicyBodyHtml = async () => {
  const policyPath = path.join(process.cwd(), "policy.html");
  const raw = await readFile(policyPath, "utf8");
  const body = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? raw;

  const cleaned = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sstyle='[^']*'/gi, "")
    .replace(/\salign="[^"]*"/gi, "")
    .replace(/\salign='[^']*'/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ");

  return fillMissingSensitiveInfoDescription(wrapYesNoTableCells(cleaned));
};

const PrivacyPage = async () => {
  const policyHtml = await getPolicyBodyHtml();

  return (
    <SitePageShell>
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12">
          <span className="font-heading text-[10px] font-bold tracking-[2.5px] uppercase opacity-60 mb-2 block">
            DAD HEALTH LEGAL
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-heading text-[42px] lg:text-[56px] font-extrabold uppercase leading-none tracking-wide">
              PRIVACY POLICY
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-background">
  <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-8 lg:py-10">
    <div className="w-full overflow-x-auto">
      <article
        className="max-w-none text-muted-foreground text-[15px] leading-7
          [&_h1]:font-heading [&_h1]:text-[30px] [&_h1]:leading-tight [&_h1]:font-extrabold [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:!text-primary
          [&_h2]:font-heading [&_h2]:text-[28px] [&_h2]:leading-tight [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:!text-primary
          [&_h3]:font-heading [&_h3]:text-[20px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:!text-primary
          [&_p]:my-3 [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6

          /* Responsive table styles */
          [&_table]:w-full [&_table]:mb-0 [&_table+table]:mt-0 [&_table+table]:border-t-0
          [&_table]:border [&_table]:border-border [&_table]:rounded-sm
          [&_table]:overflow-hidden [&_table]:[border-collapse:collapse]
          [&_table]:min-w-[320px] [&_table]:lg:min-w-[780px]

          /* Header styles */
          [&_th]:px-3 [&_th]:py-3 [&_th]:lg:px-4 [&_th]:!text-left [&_th]:font-heading [&_th]:text-[10px]
          [&_th]:font-extrabold [&_th]:tracking-[1.8px] [&_th]:uppercase [&_th]:!text-primary [&_th]:bg-muted/40

          /* Column widths - responsive */
          [&_th:first-child]:w-[30%] [&_th:first-child]:lg:w-[25%]
          [&_th:nth-child(2)]:w-[55%] [&_th:nth-child(2)]:lg:w-[60%]
          [&_th:last-child]:w-[15%] [&_th:last-child]:text-right [&_th:last-child]:whitespace-nowrap

          /* Cell styles */
          [&_td]:px-3 [&_td]:py-3 [&_td]:lg:px-4 [&_td]:align-top [&_td]:break-words [&_td]:whitespace-normal
          [&_td]:!tracking-normal [&_td]:!leading-7 [&_td]:![letter-spacing:0px]
          [&_td]:![word-spacing:0px] [&_td]:![text-rendering:auto]
          [&_td]:[text-align:left] [&_td]:[font-kerning:none]
          [&_td_*]:!tracking-normal [&_td_*]:![letter-spacing:0px] [&_td_*]:![word-spacing:0px]

          /* Cell widths */
          [&_td:first-child]:w-[30%] [&_td:first-child]:lg:w-[25%]
          [&_td:nth-child(2)]:w-[55%] [&_td:nth-child(2)]:lg:w-[60%]
          [&_td:last-child]:w-[15%] [&_td:last-child]:text-right [&_td:last-child]:whitespace-nowrap

          /* Row borders */
          [&_tr]:border-b [&_tr]:border-border
          [&_strong]:text-foreground
          [&_a]:text-primary [&_a]:no-underline [&_a]:decoration-transparent [&_a]:transition-all
          [&_a]:duration-200 [&_a:hover]:underline [&_a:hover]:underline-offset-4
          [&_a:hover]:decoration-[hsl(78,89%,65%)]

          /* Mobile optimizations */
          @media (max-width: 768px) {
            [&_td], [&_th] {
              @apply px-2 py-2;
            }
            
            [&_td:first-child], [&_th:first-child] {
              @apply w-[35%];
            }
            
            [&_td:nth-child(2)], [&_th:nth-child(2)] {
              @apply w-[50%];
            }
            
            [&_td:last-child], [&_th:last-child] {
              @apply w-[15%];
            }
          }"
        dangerouslySetInnerHTML={{ __html: policyHtml }}
      />
    </div>
  </div>
</section>

      <SiteFooter />
    </SitePageShell>
  );
};

export default PrivacyPage;