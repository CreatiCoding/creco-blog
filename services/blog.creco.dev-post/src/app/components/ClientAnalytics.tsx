'use client'

import Script from "next/script"

export function ClientAnalytics({ projectId }: { projectId: string }) {
    const isClient = typeof window !== 'undefined';
    const isProduction = isClient && window.location.host === 'blog.creco.dev';

    if (!isProduction) {
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