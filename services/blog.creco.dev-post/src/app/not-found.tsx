'use client';

import { useEffect } from 'react';
import Link from 'next/link'
import { PostPage } from './(id)/PostPage';
import { useState } from 'react';

export default function NotFound() {
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        const pathname = window.location.pathname;
        if (pathname === '/') {
            window.location.href = '/post';
            return;
        }

        const id = pathname.split('/').filter(x => x !== '').pop()!;
        setId(id);
    }, []);


    if (id === '404') {
        return (
            <div className="bg-[#232323] min-h-screen text-[#DEDEDD] text-base">
                <div className="desktop-ui flex justify-center bg-[#232323] min-h-screen text-[#DEDEDD] text-base">
                    <div className="bg-[#2B2B29] max-w-[1200px] w-full py-[16px] px-[20px] shadow-[0_0_4px_20px_#2B2B29] text-base">
                        <h1 className="text-[3.6rem] font-extrabold">Not Found</h1>
                        <div className="h-[20px]" />
                        <span className="text-[2.4rem] text-center break-normal">페이지를 찾을 수 없습니다.</span>
                        <div className="h-[20px]" />
                        <Link href="/" className="text-[2.4rem] text-center underline break-normal">홈으로 돌아가기</Link>
                    </div>
                </div>
            </div>
        );
    };

    if (id == null) {
        return null;
    }

    return (
        <PostPage id={id} category={''} title={''} body={''} viewCount={0} />
    );
}
