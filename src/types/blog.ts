import type { BaseEntity } from "./common";

/**
 * Blog type definitions.
 */
export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: BlogAuthor;
  tags: string[];
  category: string;
  readTime: number;
  publishedAt: string;
}

export interface BlogAuthor {
  name: string;
  avatar?: string;
  bio?: string;
}
