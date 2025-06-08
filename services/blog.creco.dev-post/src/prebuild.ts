#!/usr/bin/env node

import axios, { isAxiosError } from "axios";
import { parsePost } from "./app/entities/post";
import { counterApi } from "./app/share/counterApi";

const fs = require('fs');
const prebuildTargetDir = './src/app/(id)/(prebuild)';
const pageTempateContent = fs.readFileSync('./src/app/(id)/page.template', 'utf-8');

(async () => {
    const { data } = await fetch('https://blog.creco.dev/github-api/api/gist/blog-post/list').then(res => res.json());

    console.log(`총 글 수: ${data.items.length}`);

    for (const item of data.items) {
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

        console.log({ id, category, title, thumbnail });

        let pageContent = pageTempateContent.replaceAll('$ID', id);
        pageContent = pageContent.replaceAll('$CATEGORY', category.replaceAll('"', '\\"'));
        pageContent = pageContent.replaceAll('$TITLE', title.replaceAll('"', '\\"'));
        pageContent = pageContent.replaceAll('$BODY', body.replaceAll('"', '\\"'));
        pageContent = pageContent.replaceAll('$THUMBNAIL', thumbnail == null ? undefined : `"${thumbnail.replaceAll("\"", "\\\"")}"`);

        if (fs.existsSync(`${prebuildTargetDir}/${id}`)) {
            fs.rmdirSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        }

        fs.mkdirSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        fs.writeFileSync(`${prebuildTargetDir}/${id}/page.tsx`, pageContent);

        // 조회수 설정 로직
        try {
            const { data } = await counterApi.getCounter('blog-post-view-count', id);
            console.log(`${id} 조회수: ${data.count}`);
        } catch (error: any) {
            if (isAxiosError(error) && error?.response?.data.message === 'record not found') {
                await counterApi.setCounter('blog-post-view-count', id, 1);
                console.log(`${id} 조회수 초기화 완료`);
            }
        }
    }

    // const list = [
    //     { id: "e403a714-d094-4641-8939-1fb7bb8b7758", count: 1359 },
    //     { id: "0a59aa9e-685d-4080-96ae-6b605b2bbc99", count: 1161 },
    //     { id: "50ed179b-0e6c-481f-9447-bb44e0b5a16d", count: 414 },
    //     { id: "f8c7be72-91cc-4ef1-84bc-4fab213abd4e", count: 224 },
    //     { id: "90b6136f-3d46-49f5-a690-bf7dd8305990", count: 184 },
    //     { id: "bda4eec5-10b3-4aa8-898e-f3843a99c0a6", count: 85 },
    //     { id: "ba373276-7754-424e-9856-a86ef883c155", count: 46 },
    //     { id: "4d7ad8bc-7ccf-44d4-ae73-404b7b7c065f", count: 44 },
    //     { id: "e9e1ea84-945a-47d3-a48f-f01268489528", count: 43 },
    //     { id: "f6ab5489-47ef-4330-8059-8bbcf8e103df", count: 35 },
    //     { id: "40075d31-5db4-408e-8b82-90641c47bd16", count: 30 },
    //     { id: "deabe9c6-7938-49f8-b8b6-9e2582b8d599", count: 28 },
    //     { id: "8493cf6d-bf28-431b-abf6-0ad1c5f99e68", count: 24 },
    //     { id: "91eb16f6-5424-48ca-a663-8f329d7b297a", count: 22 },
    //     { id: "a7043a4c-24e8-4eb6-82e2-5f7d22cf95f1", count: 22 },
    //     { id: "61462799-63d9-45ae-8a05-d5d84f5cb349", count: 19 },
    //     { id: "631a6b4f-9ba9-4a7b-839d-33c5380916af", count: 16 },
    //     { id: "1a1144ef-76d3-4419-922b-5dcf6c50d1df", count: 28 },
    // ];
    // for (const { id, count } of list) {
    //     await counterApi.setCounter('blog-post-view-count', id, count);
    //     console.log(`${id} ${count}`);
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    // }
})();