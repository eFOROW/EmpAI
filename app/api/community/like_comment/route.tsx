import { NextResponse } from 'next/server';
import connectToDatabase from "@/lib/mongodb/mongodb";
import Post from '@/lib/mongodb/models/Post';
import { verifyAuth } from "@/lib/firebase/auth_middleware";
import { Types } from 'mongoose';

export async function POST(request: Request) {
 try {
   console.log("=== API Called ===");
   const decodedToken = await verifyAuth();
   console.log("Auth verified:", decodedToken);

   const { searchParams } = new URL(request.url);
   const postId = searchParams.get('id');
   const action = searchParams.get('action');
   console.log("Params:", { postId, action });

   let data;
   try {
     data = await request.json();
   } catch (e) {
     console.log("No request body");
   }

   if (!postId || !action) {
     return NextResponse.json(
       { message: "필수 매개변수가 누락되었습니다." },
       { status: 400 }
     );
   }

   console.log("Connecting to DB...");
   await connectToDatabase();
   console.log("DB Connected");

   const post = await Post.findById(postId);
   console.log("Post found:", post ? "yes" : "no");

   if (!post || post.isDeleted) {
     return NextResponse.json(
       { message: "게시글을 찾을 수 없습니다." },
       { status: 404 }
     );
   }

   if (!decodedToken || !decodedToken.uid) {
     return NextResponse.json(
       { message: "유효하지 않은 사용자 인증 정보입니다." },
       { status: 401 }
     );
   }

   if (action === 'like') {
     try {
       console.log("=== Like Action Start ===");
       console.log("Current post:", post);
       console.log("Current likes:", post.likes);

       // likes 배열이 없으면 초기화
       if (!Array.isArray(post.likes)) {
         post.likes = [];
         console.log("Initialized likes array");
       }

       const userUid = String(decodedToken.uid);
       console.log("User UID:", userUid);

       const likeIndex = post.likes.indexOf(userUid);
       console.log("Like index:", likeIndex);

       // 좋아요 토글
       if (likeIndex > -1) {
         post.likes = post.likes.filter((id: string) => id !== userUid);
         console.log("Like removed");
       } else {
         post.likes.push(userUid);
         console.log("Like added");
       }

       console.log("Updated likes before save:", post.likes);
       await post.save();
       console.log("Post saved successfully");

       return NextResponse.json({
         message: likeIndex > -1 ? "좋아요가 취소되었습니다." : "좋아요가 추가되었습니다.",
         likes: post.likes,
         totalLikes: post.likes.length,
         isLiked: post.likes.includes(userUid)
       }, { status: 200 });
     } catch (error) {
       console.error("=== Like Error ===");
       console.error("Error type:", typeof error);
       console.error("Error details:", error);
       return NextResponse.json(
         { message: "좋아요 처리 중 오류가 발생했습니다.", error: String(error) },
         { status: 500 }
       );
     }
   }

   // 댓글 작성
   if (action === 'comment') {
     const newComment = {
       content: data.content,
       author: {
         uid: decodedToken.uid,
         name: data.authorName,
         email: decodedToken.email
       },
       createdAt: new Date()
     };

     post.comments.push(newComment);
     await post.save();
     return NextResponse.json(newComment, { status: 201 });
   }

   return NextResponse.json(
     { message: "잘못된 action 매개변수입니다." },
     { status: 400 }
   );

 } catch (error) {
   console.error("=== Main Error ===");
   console.error("Error type:", typeof error);
   console.error("Error details:", error);

   if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
     return NextResponse.json(
       { message: "인증이 필요합니다." },
       { status: 401 }
     );
   }
   return NextResponse.json(
     { 
       message: "요청 처리 실패", 
       error: error instanceof Error ? error.message : 'Unknown error',
       details: String(error)
     },
     { status: 500 }
   );
 }
}

export async function DELETE(request: Request) {
 try {
   const decodedToken = await verifyAuth();
   const { searchParams } = new URL(request.url);
   const postId = searchParams.get('id');
   const commentId = searchParams.get('commentId');

   if (!postId || !commentId) {
     return NextResponse.json(
       { message: "필수 매개변수가 누락되었습니다." },
       { status: 400 }
     );
   }

   await connectToDatabase();

   const post = await Post.findById(postId);
   if (!post || post.isDeleted) {
     return NextResponse.json(
       { message: "게시글을 찾을 수 없습니다." },
       { status: 404 }
     );
   }

   const comment = post.comments.id(commentId);
   if (!comment) {
     return NextResponse.json(
       { message: "댓글을 찾을 수 없습니다." },
       { status: 404 }
     );
   }

   if (comment.author.uid !== decodedToken.uid) {
     return NextResponse.json(
       { message: "댓글 삭제 권한이 없습니다." },
       { status: 403 }
     );
   }

   comment.remove();
   await post.save();
   return NextResponse.json({ message: "댓글이 삭제되었습니다." });

 } catch (error) {
   console.error("=== Delete Error ===");
   console.error("Error type:", typeof error);
   console.error("Error details:", error);

   if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
     return NextResponse.json(
       { message: "인증이 필요합니다." },
       { status: 401 }
     );
   }
   return NextResponse.json(
     { 
       message: "댓글 삭제 실패", 
       error: error instanceof Error ? error.message : 'Unknown error',
       details: String(error)
     },
     { status: 500 }
   );
 }
}