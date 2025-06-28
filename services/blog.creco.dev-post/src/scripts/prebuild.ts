#!/usr/bin/env yarn tsx
import axios from "axios";
import { parsePost } from "../app/entities/post";
import fs from 'fs';

const prebuildTargetDir = './src/app/(id)/(prebuild)';
const pageTempateContent = fs.readFileSync('./src/app/(id)/page.template', 'utf-8');

(async () => {
    const { data } = await fetch('https://blog.creco.dev/github-api/api/gist/blog-post/list').then(res => res.json());

    console.log(`총 글 수: ${data.items.length}`);

    const list = await fetch('https://app.divops.kr/api/blog/stats').then(res => res.json());

    for (const item of data.items) {
        const viewCount = list?.find((x: { id: string }) => x.id === item.id)?.viewCount ?? 0;
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
        pageContent = pageContent.replaceAll('$BODY', body.replaceAll('"', '\\"').replaceAll('`', '\`'));
        pageContent = pageContent.replaceAll('$THUMBNAIL', thumbnail == null ? 'undefined' : `"${thumbnail.replaceAll("\"", "\\\"")}"`);
        pageContent = pageContent.replaceAll('$VIEWCOUNT', viewCount.toString());

        if (fs.existsSync(`${prebuildTargetDir}/${id}`)) {
            fs.rmSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        }

        fs.mkdirSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        fs.writeFileSync(`${prebuildTargetDir}/${id}/page.tsx`, pageContent);
    }
})();