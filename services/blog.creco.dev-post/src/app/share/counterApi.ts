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

const COUNTER_API_PATH = ({ name, id }: { name: string, id: string }) => {
    return `${BASE_URL}/${COUNTER_NAMESPACE()}-${name}-${id}`;
}

export const counterApi = {
    getCounter: async (name: string, id: string) => {
        return await client.get(COUNTER_API_PATH({ name, id }));
    },
    upCounter: async (name: string, id: string) => {
        const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        return await client.get(`${isLocalHost ? 'localhost-' : ''}${COUNTER_API_PATH({ name, id })}/up`);
    },
    setCounter: async (name: string, id: string, count: number) => {
        const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        return await client.get(`${isLocalHost ? 'localhost-' : ''}${COUNTER_API_PATH({ name, id })}/set?count=${count}`);
    }
}

