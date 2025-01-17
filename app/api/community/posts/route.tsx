import { NextResponse } from 'next/server';
import connectToDatabase from "@/lib/mongodb/mongodb";
import Post from '@/lib/mongodb/models/Post';
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await connectToDatabase();

    // 단일 게시글 조회
    if (id) {
      const post = await Post.findById(id);
      if (!post || post.isDeleted) {
        return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
      }
      // 조회수 증가
      await Post.findByIdAndUpdate(id, { $inc: { views: 1 } });
      return NextResponse.json(post);
    }

    // 게시글 목록 조회 (검색, 필터링, 정렬)
    const searchType = searchParams.get('searchType');
    const searchQuery = searchParams.get('searchQuery');
    const sortBy = searchParams.get('sortBy');
    const category = searchParams.get('category');

    let query: any = { isDeleted: false };
    
    if (searchQuery) {
      switch (searchType) {
        case 'title':
          query.title = { $regex: searchQuery, $options: 'i' };
          break;
        case 'content':
          query.content = { $regex: searchQuery, $options: 'i' };
          break;
        case 'author':
          query['author.name'] = { $regex: searchQuery, $options: 'i' };
          break;
      }
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    let sort = {};
    switch (sortBy) {
      case 'views':
        sort = { views: -1 };
        break;
      case 'likes':
        sort = { likesCount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const posts = await Post.find(query).sort(sort).limit(20);
    return NextResponse.json(posts);

  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "요청 처리 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    const data = await request.json();

    await connectToDatabase();

    // 게시글 수정
    if (postId) {
      const post = await Post.findById(postId);
      if (!post || post.isDeleted) {
        return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
      }

      if (post.author.uid !== decodedToken.uid) {
        return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
      }

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: { title: data.title, content: data.content, category: data.category } },
        { new: true }
      );
      return NextResponse.json(updatedPost);
    }

    // 새 게시글 작성
    data.author = {
      uid: decodedToken.uid,
      name: data.authorName,
      email: decodedToken.email
    };

    const newPost = new Post(data);
    const savedPost = await newPost.save();
    return NextResponse.json(savedPost, { status: 201 });

  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "요청 처리 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ message: "게시글 ID가 필요합니다." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (post.author.uid !== decodedToken.uid) {
      return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
    }

    post.isDeleted = true;
    await post.save();
    return NextResponse.json({ message: "게시글이 삭제되었습니다." });

  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.json(
      { message: "게시글 삭제 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}