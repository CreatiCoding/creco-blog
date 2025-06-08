import axios from 'axios';

const BASE_URL = "https://app.divops.kr/api/counter-blog-creco-dev";

const client = axios.create({
    timeout: 30_000,
    baseURL: BASE_URL,
    headers: {
        common: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    },
    validateStatus: function (status: number) {
        return status == 200;
    },
});

const COUNTER_NAMESPACE = () => {
    return `creco-blog-${typeof window !== 'undefined' ? `${window.location.hostname}` : 'blog.creco.dev'}`;
}

export const COUNTER_API_PATH = ({ name, id, postfix }: { name: string, id: string, postfix?: string }) => {
    return `${BASE_URL}/${COUNTER_NAMESPACE()}${postfix ?? ''}-${name}-${id}`;
}

export const counterApi = {
    getCounter: async (name: string, id: string) => {
        const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const postfix = isLocalHost ? '-localhost' : '';
        return await client.get(COUNTER_API_PATH({ name, id, postfix }));
    },
    upCounter: async (name: string, id: string) => {
        const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const postfix = isLocalHost ? '-localhost' : '';
        return await client.get(`${COUNTER_API_PATH({ name, id, postfix })}/up`);
    },
    setCounter: async (name: string, id: string, count: number) => {
        const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const postfix = isLocalHost ? '-localhost' : '';
        return await client.get(`${COUNTER_API_PATH({ name, id, postfix })}/set?count=${count}`);
    }
}

