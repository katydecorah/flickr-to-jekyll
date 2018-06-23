# flickr-to-jekyll

🖼 Save the Flickr photos in your Jekyll posts

This script will:
+ Scan your `_posts` folder for Flickr hosted images (jpg, png, gif).
+ Retrieve the original size of the photo and download it using the title of the post for a filename.
+ Update the post with the new image path names.

## Set up

Rename `.sample-env` to `.env` and add the following values to the parameters:

- `FLICKR_KEY` - [Create a Flickr app](https://www.flickr.com/services/apps/create/) to get an API key.
- `FLICKR_SECRET` - Your Flickr app's API secret.

From terminal:

```
npm install && npm link
```

## Run it

From terminal:

```
flickr-to-jekyll
```

To change where you have your posts saved or where you want to save your image:

```
flickr-to-jekyll --img_dir='example/img/posts' --posts_dir='example/_posts'
```

The default for `img_dir` is `img/posts`. The default for `posts_dir` is `_posts`
