/* Shared commercial rules for the browser and the static packaging command. */
(() => {
  const p = window.HALLOWEEN_CONFIG;
  const a = window.HALLOWEEN_ASSETS;
  const hotmart = (url) => {
    try {
      const u = new URL(url);
      return (
        u.protocol === "https:" &&
        ["pay.hotmart.com", "checkout.hotmart.com"].includes(u.hostname)
      );
    } catch {
      return false;
    }
  };
  const core = () =>
    p.core.available &&
    p.core.approved &&
    p.core.files.length > 0 &&
    a.masks.length === p.maskCount;
  const ready = (offer) =>
    !!(
      offer?.enabled &&
      offer.contentsApproved &&
      core() &&
      p.core.deliveryVerified &&
      typeof offer.price === "number" &&
      Number.isFinite(offer.price) &&
      offer.price >= 0 &&
      hotmart(offer.checkoutUrl) &&
      p.policies.approved &&
      ["privacy", "terms", "refund"].every((k) => p.policies[k].length > 0) &&
      p.license.approved &&
      p.license.repeatPrinting &&
      p.license.classroomUse &&
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.supportEmail) &&
      /^https:\/\//.test(p.siteUrl) &&
      p.businessName
    );
  const price = (value) =>
    typeof value === "number" && Number.isFinite(value)
      ? new Intl.NumberFormat(p.locale, {
          style: "currency",
          currency: p.currency,
        }).format(value)
      : "Price coming soon";
  const bonuses = () =>
    p.bonuses.filter(
      (b) => b.available && b.approved && b.preview && a[b.preview],
    );
  window.HALLOWEEN_OFFERS = {
    hotmart,
    core,
    ready,
    price,
    bonuses,
    basic: () =>
      !!(
        p.offers.basic.enabled &&
        p.offers.basic.contentsApproved &&
        core() &&
        hotmart(p.offers.basic.checkoutUrl)
      ),
  };
})();
