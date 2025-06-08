'use client';

import React, { HTMLAttributes, useEffect, useState } from "react";
import Giscus from '@giscus/react';
import styles from './PostPage.module.css';
import Link from "next/link";
import { getMarkdown, parsePost } from "../entities/post";
import { counterApi } from "../share/counterApi";
import { isAxiosError } from "axios";
import { useAsyncEffect } from "react-simplikit";
import { useQuery } from "@tanstack/react-query";

const useViewCountInitialize = (id: string) => {
    useAsyncEffect(async () => {
        try {
            await counterApi.getCounter('blog-post-view-count', id);
            console.log('already initialized.')
        } catch (error) {
            if (isAxiosError(error) && error?.response?.data.message === 'record not found') {
                await counterApi.setCounter('blog-post-view-count', id, 1);
                console.log('initialized success.')
            }
        }
    }, [id]);
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`bg-[#232323] text-[#DEDEDD] text-base px-[10px] py-[5px] rounded-md flex ${className}`}>{children}</span>
}

function PostViewCountBadge({ id, className }: { id: string, className?: string }) {
    useViewCountInitialize(id);

    const { data, error, isLoading } = useQuery({
        queryKey: ['view-count', id],
        queryFn: () => counterApi.getCounter('blog-post-view-count', id),
        // 재시도 하지 않음
        retry: false,

        // 포커스나 재접속 시 자동 리패치 하지 않음
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        // 컴포넌트가 마운트될 때만(fetch할 때만) 실행
        // (기본값: stale 상태라면 마운트 시 재실행)
        refetchOnMount: false,

        // 데이터가 절대 stale 상태가 아니도록 설정
        // → 한 번 성공하면 무한정 “신선”하다고 간주
        staleTime: Infinity,

        // 캐시도 남겨두어 재마운트 시 데이터를 재사용
        // → 말 그대로 “캐시 없음”을 원하시면 0 으로 설정하세요.
        cacheTime: Infinity,
    });


    const count = isLoading || error != null ? '...' : data?.data.count;

    return <Badge className={className}>
        <span>조회수</span>
        <span className="mr-0 ml-auto">{count}</span>
    </Badge>
}

const useViewFirstTodayCountUp = (id: string) => {
    useAsyncEffect(async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDateViewed = localStorage.getItem(`blog-post-view-count-${id}-view-date`);
        if (lastDateViewed == null || lastDateViewed != today) {
            await counterApi.upCounter('blog-post-view-count', id);
            localStorage.setItem(`blog-post-view-count-${id}-view-date`, today);
        }
    }, [id]);
}

export const PostPage = (props: {
    id: string;
    category: string;
    title: string;
    body: string;
}) => {
    const { id, category: defaultCategory, title: defaultTitle, body: defaultBody } = props;
    const [category, setCategory] = useState(defaultCategory);
    const [title, setTitle] = useState(defaultTitle);
    const [body, setBody] = useState(defaultBody);

    useViewFirstTodayCountUp(id);

    useEffect(() => {
        fetch(`/github-api/api/gist/blog-post/${id}`).then(res => res.json()).then(async ({ data }) => {
            if (data == null) {
                window.location.href = '/post/404';
                return;
            }

            data.body.markdown = await getMarkdown(data.body.contents);
            const parsed = parsePost(data);
            if (parsed == null) {
                return;
            }

            const { category, title, body } = parsed;
            setCategory(category);
            setTitle(title);
            setBody(body);
        }).catch(error => {
            console.error(error);
            window.location.href = '/post/404';
        });
    }, [id]);

    return (
        <div className="bg-[#232323] min-h-screen text-[#DEDEDD] text-base">
            {/* 데스크탑 전용 컨테이너 */}
            <div className="desktop-ui flex justify-center bg-[#232323] min-h-screen text-[#DEDEDD] text-base">
                <div className="bg-[#2B2B29] max-w-[1200px] w-full py-[16px] px-[20px] shadow-[0_0_4px_20px_#2B2B29] text-base">
                    <div className="max-w-[840px] mx-auto">
                        {/* 상단 로고 */}
                        <div className="py-[24px]">
                            <Link href="/" className="hover:text-white">
                                <h1 className="text-[3.6rem] font-extrabold">Creco&apos;s Blog</h1>
                            </Link>
                        </div>

                        {/* 여백 */}
                        <div className="h-[20px]" />

                        {/* 카테고리 */}
                        <h3 className="text-[2.4rem] text-center underline break-normal">{category}</h3>
                        <div className="h-[20px]" />

                        {/* 제목 */}
                        <h1 className="text-[48px] text-center underline break-keep">
                            {title}
                        </h1>

                        <div className="flex">
                            <PostViewCountBadge id={id} className="mr-0 ml-auto w-[75px]" />
                        </div>
                        <div className="h-[20px]" />

                        {/* 구분선 */}
                        <hr className="w-full border-t border-gray-200/50 transform scale-y-[0.3] my-[10px]" />

                        {/* 본문 콘텐츠 */}
                        <Post className={styles.post} dangerouslySetInnerHTML={{ __html: body! }} />

                        <div className="h-[60px]" />

                        <Giscus
                            id="comments"
                            repo="divopsor/blog.creco.dev-main"
                            repoId="R_kgDOK_YnUw"
                            category="General"
                            categoryId="DIC_kwDOK_YnU84Ch8Ry"
                            mapping="url"
                            term="Welcome to @giscus/react component!"
                            reactionsEnabled="1"
                            emitMetadata="1"
                            inputPosition="top"
                            theme="preferred_color_scheme"
                            lang="ko"
                            loading="lazy"
                            strict='0'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


const Post = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            {...props}
            className={className}
            style={{
                fontSize: '1.6rem',
                wordBreak: 'keep-all',
                ...props.style,
            }}
        />
    );
};