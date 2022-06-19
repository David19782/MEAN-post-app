import { Component,  OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostService } from "../post.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})

export class PostListComponent implements OnInit, OnDestroy{
  // posts = [
  //   {title: "First Post", content: "This is first post" },
  //   {title: "Second Post", content: "This is second post" },
  //   {title: "Third Post", content: "This is third post" },
  // ];
  authStatusSub: Subscription = new Subscription();
  userIsAuthenticated = false;
  posts: Post[] = [];
  subs: Subscription = new Subscription;
  userId: string | null = "";
  isLoading = false;
  totalPost = 0;
  currPage = 1;
  postsPerPage = 2;
  pageSizeOptions = [1, 2,  5, 10];

  constructor( public postService: PostService, private authService: AuthService) {}

  onDelete(postId: string | undefined | null){
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPost(this.postsPerPage, this.currPage)
    });
  }

  onPageChange(pageData: PageEvent){
    this.isLoading = true;
    this.currPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPost(this.postsPerPage, this.currPage)

  }

  ngOnInit(): void {

  	this.postService.getPost(this.postsPerPage, this.currPage);
    this.isLoading = true
    this.userId = this.authService.getUserId();
    this.subs = this.postService.getPostUpdatedListner().subscribe((data: {posts: Post[], postsCount: number}) => {
      this.isLoading = false;
      this.totalPost = data.postsCount;
      this.posts = data.posts;
    })
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.authStatusSub.unsubscribe();
  }


}
