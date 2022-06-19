const Post = require("../models/post")
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const express = require("express")

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  "image/jpeg": 'jpg',
  "image/jpg": "jpg"
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mymetype!");
    if(isValid){
      error = null;
    }
    cb(error, "backend/images")
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);

  }
});


router.get("", (req, res, next) => {
  console.log(req.query)
  const pageSize = Number(req.query.pageSize);
  const currentPage = Number(req.query.page);
  const postQuerry = Post.find();
  let fetchedPost;
  if(req.query.page && req.query.pageSize){
    postQuerry.skip(pageSize* (currentPage - 1)).limit(pageSize)
  }
  postQuerry
    .then(document => {
      fetchedPost = document;
      return Post.count();
    }).then(maxCount => {
      res.status(200).json({
        message: "Post fethced successfuly!",
        posts: fetchedPost,
        maxPosts: maxCount
      })
    })
})

router.get("/:id", (req,res, next) => {
  Post.findById(req.params.id).then(post => {
    if(post) {
      res.status(200).json(post)
    }else {
      res.status(404).json({message: "Post not found"})
    }
  })
})

router.delete("/:id", checkAuth ,(req,res,next) => {
  console.log(req.params.id);
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId}).then((result => {
    console.log(result)
    if(result.deletedCount > 0){
      res.status(200).json({message: "Post deleted"});
    }else {
      res.status(401).json({message: "Not authorized"})
    }
  }))
})

router.post("", checkAuth ,multer({storage: storage}).single("image") , (req,res, next) => {
  const url = req.protocol + "://" + req.get("host");
  console.log(req.userData.userId);
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save()
  .then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      post: {
        id: createdPost._id,
        title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    });
  })
 // console.log(post);
})

router.put("/:id", checkAuth , multer({storage: storage}).single("image") , (req,res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  })
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId}, post).then(result => {
    console.log(result);
    if(result.modifiedCount > 0){
      res.status(200).json({message: "Update successful"})
    }else {
      res.status(401).json({message: "Not authorized"})
    }
  })
})

module.exports = router;
