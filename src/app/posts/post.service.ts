import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators'
import { Post } from "./post.model"
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: "root"
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postsCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPost(postsPerPage: number, currPage: number){
    const querryParams = `?pageSize=${postsPerPage}&page=${currPage}`
    this.http.get<{message: string, posts: {title:string, _id: string, content: string, imagePath: string, creator: string}[], maxPosts: number}>("http://localhost:3000/api/posts" + querryParams)
    .pipe(map(postData => {
      return {posts: postData.posts.map(post => {
        return {
          title: post.title,
          id: post._id,
          content: post.content,
          imagePath: post.imagePath,
          creator: post.creator
        }
      }), maxPosts: postData.maxPosts}
    }))
    .subscribe((posts) => {
      console.log(posts);
      this.posts = [...posts.posts];
      this.postsUpdated.next({posts: this.posts.slice(), postsCount: posts.maxPosts});
    })
  }

  getPostUpdatedListner() {
    return this.postsUpdated.asObservable();
  }

  getSinglePost(id: string | null){
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>("http://localhost:3000/api/posts/" + id) ;
  }

  updatePost(id : string, title : string, content: string, image: File | string) {
    let postData: Post | FormData;
    if(typeof(image) == "object"){
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append("content", content);
      postData.append("image", image, title)
    }else{
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      }
    }
    this.http.put("http://localhost:3000/api/posts/" + id, postData)
    .subscribe(res => {
      this.router.navigate(["/"])
    })

  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title)

    this.http.post<{message: string, post: Post}>("http://localhost:3000/api/posts", postData)
    .subscribe((responceData) => {
      this.router.navigate(["/"])
    })

  }

  deletePost(postId: string | undefined | null) {
    const currId = postId;
    const url = "http://localhost:3000/api/posts/" + postId;
    console.log(url);
    return this.http.delete("http://localhost:3000/api/posts/" + postId)

  }
}
