'use client';

import React, { HTMLAttributes, useEffect, useState } from "react";
import Giscus from '@giscus/react';
import styles from './PostPage.module.css';
import Link from "next/link";
import { getMarkdown, parsePost } from "../entities/post";

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

    useEffect(() => {
        fetch(`/github-api/api/gist/blog-post/${id}`).then(res => res.json()).then(async ({ data }) => {
            data.body.markdown = await getMarkdown(data.body.contents);
            const parsed = parsePost(data);
            if (parsed == null) {
                return;
            }

            const { category, title, body } = parsed;
            setCategory(category);
            setTitle(title);
            setBody(body);
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