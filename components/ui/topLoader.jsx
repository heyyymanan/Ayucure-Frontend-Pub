"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";




export default function TopLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    NProgress.configure({
        trickle: true,
        showSpinner: false,
        easing: "ease-in-out",
        trickleSpeed: 200,
        minimum: 0.1,
    });

    useEffect(() => {
        NProgress.start();

        // small delay looks smoother
        const timer = setTimeout(() => {
            NProgress.done();
        }, 300);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return null;
}
