#!/usr/bin/env node
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import axios from "axios";
import { parsePost } from "./app/entities/post";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const prebuildTargetDir = './src/app/(id)/(prebuild)';
const pageTempateContent = fs.readFileSync('./src/app/(id)/page.template', 'utf-8');

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

    console.log(`총 글 수: ${data.items.length}`);

    const list = await getPageViewsPerPage({
        propertyId: GA4_PROPERTY_ID,
        projectId: GA4_PROJECT_ID,
        googleClientEmail: GA4_GOOGLE_CLIENT_EMAIL,
        googlePrivateKey: GA4_GOOGLE_PRIVATE_KEY,
    });

    for (const item of data.items) {
        const viewCount = list?.find(x => x.id === item.id)?.count ?? 0;
        const { id } = item;
        const { data: freshData } = await fetch(`https://blog.creco.dev/github-api/api/gist/blog-post/${id}`).then(res => res.json());

        const { data } = await axios.post("https://blog.creco.dev/api/markdown/render", {
            markdown: freshData.body.contents,
        });
        freshData.body.markdown = data.data;

        const parsed = parsePost(freshData!);

        if (parsed == null) {
            continue;
        }

        const { category, title, body, thumbnail } = parsed;

        console.log({
            id: item.id,
            제목: `[${category}] ${title}`,
            조회수: viewCount,
        })

        let pageContent = pageTempateContent.replaceAll('$ID', id);
        pageContent = pageContent.replaceAll('$CATEGORY', category.replaceAll('"', '\\"'));
        pageContent = pageContent.replaceAll('$TITLE', title.replaceAll('"', '\\"'));
        pageContent = pageContent.replaceAll('$BODY', body.replaceAll('"', '\\"'));
        pageContent = pageContent.replaceAll('$THUMBNAIL', thumbnail == null ? 'undefined' : `"${thumbnail.replaceAll("\"", "\\\"")}"`);
        pageContent = pageContent.replaceAll('$VIEWCOUNT', viewCount.toString());

        if (fs.existsSync(`${prebuildTargetDir}/${id}`)) {
            fs.rmSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        }

        fs.mkdirSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        fs.writeFileSync(`${prebuildTargetDir}/${id}/page.tsx`, pageContent);
    }
})();