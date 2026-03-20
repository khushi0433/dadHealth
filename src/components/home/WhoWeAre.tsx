import LimeButton from "@/components/LimeButton";
import Link from "next/link";

interface WhoWeAreProps {
  gymImg: string;
}

const WhoWeAre = ({ gymImg }: WhoWeAreProps) => (
  <section className="bg-black border-b-4 border-primary pt-8 lg:pt-10 pb-16 lg:pb-20">
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 lg:items-stretch px-5 lg:px-8">
      <div className="relative min-h-[300px] lg:min-h-0 lg:h-full rounded-2xl overflow-hidden">
        <img
          src={gymImg}
          alt="Gym weights"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="px-5 py-12 lg:px-16 lg:py-20">
        <span className="inline-block font-heading text-[10px] font-bold tracking-[2.5px] uppercase bg-primary text-primary-foreground px-2 py-0.5 mb-2">WHO WE ARE</span>
        <h2 className="font-heading text-[36px] lg:text-[48px] font-extrabold text-foreground uppercase leading-none mt-3 mb-6">
          WHO WE ARE
        </h2>
        <p className="text-sm text-muted-foreground leading-[1.75] mb-4">
          Dad Health is helping to get men talking about their mental health — the stigmas
          attached to it, the anxiety of being a parent, the stresses we all encounter. What
          we go through, what we worry about, and how can we combat it together.
        </p>
        <p className="text-sm text-muted-foreground leading-[1.75] mb-4">
          Through real-life experiences, Dad Health will offer both exercise and nutrition
          guidance, the necessary accountability checks and motivation needed to "kill the old
          version" of you in search of the best version for your family.
        </p>
        <p className="text-sm text-muted-foreground leading-[1.75] mb-8">
          Lastly, Dad Health, being a community based around being a parent, will offer tips
          for fun days with the kids, recipes to cook together, takeaway alternatives and any
          other snippets we wish we knew sooner.
        </p>
        <Link href="/pricing">
          <LimeButton>TAKE ACTION →</LimeButton>
        </Link>
      </div>
    </div>
  </section>
);

export default WhoWeAre;
