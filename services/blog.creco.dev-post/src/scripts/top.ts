#!/usr/bin/env yarn tsx
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

const GA4_PROPERTY_ID = '456644016';
const GA4_PROJECT_ID = 'divops-app-divops-kr-api';
const { GA4_GOOGLE_CLIENT_EMAIL = '', GA4_GOOGLE_PRIVATE_KEY = '' } = process.env;

async function getPageViewsPerPage({
    propertyId,
    projectId,
    googleClientEmail: client_email,
    googlePrivateKey: private_key,
    startDate = '2024-01-01',
    endDate = 'today',
}: {
    propertyId: string;
    projectId: string;
    googleClientEmail: string;
    googlePrivateKey: string;
    startDate?: string;
    endDate?: string;
}) {
    if (client_email === "" || private_key === "") {
        throw new Error('Google client email or private key is not set');
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email,
            private_key: private_key.replace(/\\n/g, '\n'),
        },
        projectId,
    });

    return await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        dateRanges: [{ startDate, endDate }],
    }).then(([response]) => response.rows?.map(row => ({
        page: row.dimensionValues?.[0]?.value,
        pageViews: row.metricValues?.[0]?.value,
    }))
        .filter(row => row.page?.[14] === '-')
        .map(x => ({
            ...x,
            page: x.page?.replace(/\/$/, '').replace('/post/', ''),
        }))
        .reduce((acc: { id: string; count: number }[], { page: id, pageViews }) => {
            const item = acc.find((x: { id: string }) => x.id === id);
            if (item) {
                item.count += Number(pageViews);
            } else {
                acc.push({
                    id: id!
                    , count: Number(pageViews)
                });
            }
            return acc;
        }, []));
}

(async () => {
    const { data } = await fetch('https://blog.creco.dev/github-api/api/gist/blog-post/list').then(res => res.json());

    const list = await getPageViewsPerPage({
        propertyId: GA4_PROPERTY_ID,
        projectId: GA4_PROJECT_ID,
        googleClientEmail: GA4_GOOGLE_CLIENT_EMAIL,
        googlePrivateKey: GA4_GOOGLE_PRIVATE_KEY,
    });

    console.log(`ID\t\t\t\t\t카테고리\t조회수\t제목`);

    let postList = [];
    for (const item of data.items) {
        const id = item.id;
        const [category, title] = item.body.contents.split('\n').filter((x: string) => x !== '');
        const viewCount = list?.find(x => x.id === id)?.count ?? 0;
        postList.push({
            id,
            category,
            title,
            viewCount,
        });
    }

    postList.sort((a, b) => b.viewCount - a.viewCount);

    for (const { id, category, title, viewCount } of postList) {
        console.log(`${id}\t${category}\t\t${viewCount}\t${title}`);
    }
})();