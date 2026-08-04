"use client";

import NextTopLoader from "nextjs-toploader";

// রুট বদলানোর সময় ওপরে একটা প্রগ্রেস বার দেখানোর জন্য —
// এতে পেজ লোড হতে সময় লাগলেও ইউজার বুঝতে পারবে কিছু একটা হচ্ছে,
// পুরো অ্যাপ "আটকে গেছে" মনে হবে না।
export default function TopLoader() {
  return <NextTopLoader color="#FFC94A" height={3} showSpinner={false} shadow="0 0 10px #FFC94A,0 0 5px #FFC94A" />;
}
