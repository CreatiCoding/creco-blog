import { useGistList } from '@divops-packages/blog-creco-dev';
import { useGistItem } from "@divops-packages/blog-creco-dev";
import { useEffect, useState } from "react";
import { getMarkdown, Item, parsePost } from '../post';

export function usePost(id: string) {
    const detailData = useGistItem('blog-post', id, {
        prefix: "/github-api/api/gist",
    });

    const [data, setData] = useState<Item | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const item = detailData?.data as Item;
                if (item?.body == null) {
                    return;
                }

                item.body.markdown = await getMarkdown(item.body.contents);
                setData(item);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [detailData]);

    return data;
}

export function usePosts() {
    return (useGistList('blog-post') ?? []).map(parsePost) as ReturnType<typeof parsePost>[];
}
