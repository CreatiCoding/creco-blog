import { Metadata } from "next";
import { PostsPage } from "./PostsPage";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Creco&apos;s Blog',
        description: 'developer for developer',
        openGraph: {
            images: ['https://divopsor.github.io/blog-images/2025/creco-s-blog.png']
        },
    }
}

export default PostsPage;