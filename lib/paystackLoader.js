// ✅ Global Paystack Loader (used by all components)
let paystackReady = false;
let paystackPromise = null;

export const loadPaystack = () => {
  if (paystackReady) return Promise.resolve(window.PaystackPop);
  if (paystackPromise) return paystackPromise;

  paystackPromise = new Promise((resolve, reject) => {
    if (window.PaystackPop && typeof window.PaystackPop.setup === "function") {
      paystackReady = true;
      resolve(window.PaystackPop);
      return;
    }

    const scriptId = "paystack-script";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.onload = () => {
        paystackReady = true;
        resolve(window.PaystackPop);
      };
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      paystackReady = true;
      resolve(window.PaystackPop);
    };
    script.onerror = () => reject("Failed to load Paystack SDK.");
    document.body.appendChild(script);
  });

  return paystackPromise;
};
