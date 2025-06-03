#!/usr/bin/env node

import axios from "axios";
import { getMarkdown, parsePost } from "./app/entities/post";

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

        console.log({ id, category, title, body, thumbnail });

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
    }
})();