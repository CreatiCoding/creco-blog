'use client'

import { usePathname } from "next/navigation";
import Script from "next/script"

export function ClientAnalytics({ projectId }: { projectId: string }) {
    const isClient = typeof window !== 'undefined';
    const isProduction = isClient && window.location.host === 'blog.creco.dev';
    const pathname = usePathname();

    if (!isProduction) {
        return null;
    }

    if (pathname === '/stats/') {
        return null;
    }

    return (
        <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${projectId}`}></Script>
            <Script type="text/javascript" children={`
                window.dataLayer = window.dataLayer || [];
                function gtag() {
                    dataLayer.push(arguments); 
                }
                gtag('js', new Date());
                gtag('config', '${projectId}');
            `} />
        </>
    )
}