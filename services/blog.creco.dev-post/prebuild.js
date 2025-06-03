#!/usr/bin/env node

const fs = require('fs');
const prebuildTargetDir = './src/app/(id)/(prebuild)';
const pageTempateContent = fs.readFileSync('./src/app/(id)/page.template', 'utf-8');

(async () => {
    const { data } = await fetch('https://blog.creco.dev/github-api/api/gist/blog-post/list').then(res => res.json());

    console.log(data.items);

    for (const item of data.items) {
        const { id } = item;

        const pageContent = pageTempateContent.replaceAll('$ID', id);

        if (fs.existsSync(`${prebuildTargetDir}/${id}`)) {
            fs.rmdirSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        }

        fs.mkdirSync(`${prebuildTargetDir}/${id}`, { recursive: true });
        fs.writeFileSync(`${prebuildTargetDir}/${id}/page.tsx`, pageContent);
    }
})();