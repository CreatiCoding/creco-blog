import { useEffect, useState } from "react";
import { getMarkdown, Item, parsePost } from '../post';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function get(url: string) {
    const { data } = await axios.get(url);

    return data;
}

const GistAPI = {
    of: ({ category, prefix = '/github-api/api/gist' }: { category: string; prefix?: string }) => ({
        readList: async () => {
            if (category == null || category === '' || category === 'undefined') {
                return [];
            }
            const { data } = await get(`${prefix}/${category}/list`);
            return data.items;
        },
        readItem: (id: string) => {
            return get(`${prefix}/${category}/${id}`);
        },
        getList: async () => {
            const { data } = await get(`${prefix}/category`);
            return data;
        },
    }),
};

function useGistList(category: string, { prefix } = { prefix: '/github-api/api/gist' }) {
    const { data } = useQuery(
        {
            queryKey: ['API.of().readList', category],
            queryFn: async () => GistAPI.of({ category, prefix }).readList(),
            initialData: null,
        }
    );

    return data;
}

function useGistItem(category: string, id: string, { prefix } = { prefix: '/github-api/api/gist' }) {
    const { data } = useQuery(
        {
            queryKey: ['API.of().readItem', category, id],
            queryFn: async () => GistAPI.of({ category, prefix }).readItem(id),
            initialData: null,
        }
    );

    return data;
}

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
