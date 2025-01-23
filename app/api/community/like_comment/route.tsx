import { NextResponse } from 'next/server';
import connectToDatabase from "@/lib/mongodb/mongodb";
import Post from '@/lib/mongodb/models/Post';
import Interaction from '@/lib/mongodb/models/Interaction';
import { verifyAuth } from "@/lib/firebase/auth_middleware";
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    const action = searchParams.get('action');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;

    if (!postId) {
      return NextResponse.json({ message: "게시글 ID가 필요합니다." }, { status: 400 });
    }

    await connectToDatabase();

    if (action === 'comments') {
      const comments = await Interaction.find({
        postId: new mongoose.Types.ObjectId(postId),
        type: 'comment'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

      const totalComments = await Interaction.countDocuments({
        postId: new mongoose.Types.ObjectId(postId),
        type: 'comment'
      });

      return NextResponse.json({ 
        comments,
        total: totalComments,
        page,
        limit
      });
    }

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
    const action = searchParams.get('action');
    
    if (!postId || !action) {
      return NextResponse.json({ message: "필수 매개변수가 누락되었습니다." }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (action === 'like') {
      const existingLike = await Interaction.findOne({
        postId: new mongoose.Types.ObjectId(postId),
        type: 'like',
        'author.uid': decodedToken.uid
      });

      if (existingLike) {
        await Interaction.findByIdAndDelete(existingLike._id);
        await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

        return NextResponse.json({
          message: "좋아요가 취소되었습니다.",
          likesCount: Math.max((post.likesCount || 1) - 1, 0)
        });
      }

      await Interaction.create({
        postId: new mongoose.Types.ObjectId(postId),
        type: 'like',
        author: {
          uid: decodedToken.uid,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Anonymous',
          email: decodedToken.email
        }
      });

      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

      return NextResponse.json({
        message: "좋아요가 추가되었습니다.",
        likesCount: (post.likesCount || 0) + 1
      });
    }

    if (action === 'comment') {
      const data = await request.json();
      
      const newComment = await Interaction.create({
        postId: new mongoose.Types.ObjectId(postId),
        type: 'comment',
        content: data.content,
        author: {
          uid: decodedToken.uid,
          name: data.authorName || decodedToken.email?.split('@')[0] || 'Anonymous',
          email: decodedToken.email
        }
      });

      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

      return NextResponse.json(newComment, { status: 201 });
    }

    return NextResponse.json({ message: "잘못된 action 매개변수입니다." }, { status: 400 });

  } catch (error) {
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
    const action = searchParams.get('action');
    const commentId = searchParams.get('commentId');

    if (!postId || !action) {
      return NextResponse.json({ message: "필수 매개변수가 누락되었습니다." }, { status: 400 });
    }

    await connectToDatabase();

    // 댓글 삭제 처리
    if (action === 'delete_comment') {
      if (!commentId) {
        return NextResponse.json({ message: "댓글 ID가 필요합니다." }, { status: 400 });
      }

      const comment = await Interaction.findOne({
        _id: commentId,
        postId: postId,
        type: 'comment'
      });

      if (!comment) {
        return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
      }

      if (comment.author.uid !== decodedToken.uid) {
        return NextResponse.json({ message: "댓글 삭제 권한이 없습니다." }, { status: 403 });
      }

      await Interaction.findByIdAndDelete(commentId);
      await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } });

      return NextResponse.json({ message: "댓글이 삭제되었습니다." });
    }

    return NextResponse.json({ message: "잘못된 action 매개변수입니다." }, { status: 400 });

  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json(
      { message: "삭제 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}