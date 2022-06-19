import { HttpParams } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Post } from "../post.model";
import { PostService } from "../post.service";
import { mimeType } from "./mime-type.validator"

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]

})
export class PostCreateComponent implements OnInit{
  content: string = "";
  title: string = "";
  postCreated = new EventEmitter<Post>();
  public mode:string = "create";
  form: FormGroup = new FormGroup({});
  public post: Post = {
    id: "",
    title: "",
    content: "",
    imagePath: null,
    creator: null
  };
  imgPreview: string = "";
  isLoading = false;
  postId: string | null = "";

  constructor( public postService: PostService, public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      'title': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      'content': new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has("postId")){
        this.mode = "edit";
        this.postId = paramMap.get("postId")
        this.isLoading = true;
        this.postService.getSinglePost(this.postId).subscribe(postData => {
          this.post = {id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath, creator: postData.creator}
          this.isLoading = false;
          this.form.setValue({'title': this.post.title, 'content': this.post.content, "image": this.post.imagePath})
        });
        //console.log("from here")
      }else{
        this.mode = "create";
        this.postId = null;
      }
    })
  }
  onImagePicked(event: Event){
    const file = ((event.target as HTMLInputElement).files as FileList)[0];


    this.form.patchValue({image: file});
    this.form.get("image")?.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imgPreview = reader.result as string;
    }
    reader.readAsDataURL(file);


  }

  onSavePost() {
    if( this.form.invalid ){
      return
    }
    this.isLoading = true;
    if( this.mode === "create"){
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    }else{
      this.postService.updatePost(this.postId as string, this.form.value.title, this.form.value.contentm, this.form.value.image)
    }
    this.form.reset();
  }
}
