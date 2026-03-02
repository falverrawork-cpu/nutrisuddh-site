import Link from "@/components/common/app-link";
import { CartItem } from "@/lib/types";
import { getCartHighlightState } from "@/lib/pricing";

type Props = {
  cart: CartItem[];
  onCheckout?: () => void;
  onAddMore?: () => void;
};

export function CartHighlightBox({ cart, onCheckout, onAddMore }: Props) {
  const state = getCartHighlightState(cart);
  const progressCurrent = state.progressCurrent ?? 0;
  const progressTarget = state.progressTarget ?? 0;
  const progressWidth =
    progressTarget > 0
      ? Math.max(6, (Math.min(progressCurrent, progressTarget) / progressTarget) * 100)
      : 0;

  return (
    <div className={`mt-4 rounded-xl border border-pine/30 bg-green-50 p-3 ${state.unlocked ? "" : "nudge-pop-glow"}`}>
      <p className="text-sm font-semibold text-pine">{state.title}</p>
      <p className="mt-1 text-xs font-medium text-gray-700">{state.message}</p>

      {progressTarget > 0 && (
        <>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
            <div className="h-full rounded-full bg-pine transition-all" style={{ width: `${progressWidth}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-gray-600">
            {Math.min(progressCurrent, progressTarget)} / {progressTarget} items added
          </p>
        </>
      )}

      {state.fomoLine && <p className="mt-1 text-[11px] text-gray-600">{state.fomoLine}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {state.showPrimaryCta && (
          <Link
            href={state.addMoreHref}
            onClick={onAddMore}
            className="focus-ring inline-flex rounded-full bg-pine px-4 py-1.5 text-xs font-semibold text-white"
          >
            {state.primaryCtaLabel}
          </Link>
        )}
        {state.showCheckoutCta && (
          <Link
            href="/checkout"
            onClick={onCheckout}
            className="focus-ring inline-flex rounded-full border border-stone bg-white px-4 py-1.5 text-xs font-semibold text-gray-700"
          >
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
