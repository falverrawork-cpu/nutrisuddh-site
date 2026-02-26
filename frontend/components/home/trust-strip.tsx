import { ShieldCheck, Sparkles, Truck, Leaf, BadgeCheck, Sprout } from "lucide-react";
import { trustPoints } from "@/data/homepage";

const icons = [ShieldCheck, Sparkles, Truck, Leaf, BadgeCheck, Sprout];

export function TrustStrip() {
  return (
    <section className="container-base mt-14">
      <div className="rounded-2xl border border-stone bg-white px-4 py-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((point, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div key={point} className="flex items-center gap-3">
                <div className="rounded-full bg-sand p-2 text-pine">
                  <Icon size={16} />
                </div>
                <p className="text-sm text-gray-700">{point}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
