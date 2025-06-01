'use client';

import React from "react";
import { usePosts } from "./entities/post";

export const PostsPage = () => {
  const posts = usePosts();

  posts.sort((itemA, itemB) => {
    if (itemA?.createdAt == null || itemB?.createdAt == null) {
      return 0;
    }

    return itemA.createdAt > itemB.createdAt ? -1 : 1
  });

  return (
    <div className="bg-[#2B2B29] min-h-screen text-[#DEDEDD] text-base">
      {/* 최상위 래퍼: html, body 배경색과 텍스트 색상 지정 */}
      <div className="desktop-ui flex justify-center bg-[#232323] min-h-screen text-[#DEDEDD]">
        {/* 가운데 정렬된 컨테이너 */}
        <div className="bg-[#2B2B29] max-w-[1200px] w-full px-16 py-6 shadow-[0_0_4px_20px_#2B2B29]">
          <div className="max-w-[840px] mx-auto">
            {/* 상단 로고 및 제목 */}
            <div className="py-6">
              <a href="https://blog.creco.dev" className="hover:text-white">
                <h1 className="text-[3.6rem] font-extrabold">Creco&apos;s Blog</h1>
              </a>
            </div>

            <div className="h-5" />

            {/* "Posts" 헤더 */}
            <p className="text-[6rem] font-extrabold">Posts</p>
            <div className="h-[14px]" />

            {/* 작성자 이름 */}
            <p className="text-[2rem] text-gray-500">Creco</p>
            <div className="h-5" />

            <hr className="w-full border-t border-gray-200/50 scale-y-[0.3]" />

            {/* 게시글 목록 */}
            <ul>
              {posts.map((post) => (
                <li key={post.id} className="w-full border-b border-gray-200/50 py-12">
                  <a
                    href={`/post/${post.id}/`}
                    className="hover:underline text-[1.6rem]"
                  >
                    <time className="text-gray-500">{post.date}</time>
                    <div className="h-1" />
                    <span className="block text-[1.2rem]">{post.category}</span>
                    <h3 className="mt-1 text-[2.4rem] font-extrabold">
                      {post.title}
                    </h3>
                    {post.description && (
                      <>
                        <div className="h-2" />
                        <span className="block text-gray-500">
                          {post.description}
                        </span>
                      </>
                    )}
                    <div className="h-5" />
                    <p className="text-[#0ea5e9]">Read more →</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

