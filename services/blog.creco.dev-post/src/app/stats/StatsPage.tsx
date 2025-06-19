'use client'

import { useQuery } from "@tanstack/react-query";

export function StatsPage() {
    const { data: stats } = useQuery<{
        id: string;
        category: string;
        viewCount: number;
        title: string;
    }[]>({
        queryKey: ['stats'],
        queryFn: () => fetch('/api/blog/stats').then(res => res.json()),
    });

    return <div className="p-4 max-w-7xl mx-auto mt-4 bg-white rounded-lg shadow-md min-h-screen flex flex-col">
        <h1 className="text-[24px] font-bold mb-4 text-center text-gray-700 mt-4">Stats</h1>
        <table className="w-full border-collapse border border-gray-300 flex-grow overflow-y-auto">
            <thead className="bg-gray-100 text-gray-700 text-sm font-semibold sticky top-0">
                <tr className="border-b border-gray-300 text-left">
                    <th className="text-[14px] text-left px-4 py-2">Category</th>
                    <th className="text-[14px] text-left px-4 py-2">Title</th>
                    <th className="text-[14px] text-left px-4 py-2">View Count</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-500 border-b border-gray-300">
                {stats?.map(stat => (
                    <tr key={stat.id} className="border-b border-gray-300 cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                            window.open(`/post/${stat.id}`, '_self');
                        }}>
                        <td className="text-[14px] text-left px-4 py-2">{stat.category}</td>
                        <td className="text-[14px] text-left px-4 py-2">{stat.title}</td>
                        <td className="text-[14px] text-left px-4 py-2">{stat.viewCount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="flex-grow"></div>
    </div>;
}