# flickr-to-jekyll

🖼 Save the Flickr photos in your Jekyll posts

This script will:

1. Scan your `_posts` folder for Flickr hosted images (jpg, png, gif).
2. Retrieve the original size of the photo and download it using the title of the post for a filename.
3. Update the post with the new image path names.

💡 Tip: This project pulls down the original file size for archival purposes. You should resize and/or compress your images (either manually or through a build script) to best manage the weight and load time of your site.

## Set up

Get your Flickr credentials:

- `FLICKR_KEY` - [Create a Flickr app](https://www.flickr.com/services/apps/create/) to get an API key.
- `FLICKR_SECRET` - Your Flickr app's API secret.

Set your environment variables with your credentials (replace the placeholders) and enter this in your terminal:

```
echo "export FLICKR_KEY=your-key-here" >> ~/.bash_profile
echo "export FLICKR_SECRET=your-secret-here" >> ~/.bash_profile
```

From terminal, install the package globally and link it so you can run it from your Jekyll site later:

```
npm install flickr-to-jekyll -g && npm link
```

## Run it

Navigate to your Jekyll site directory in terminal. From terminal, run:

```
flickr-to-jekyll
```

The default for `posts_dir` is `_posts`. The default for `img_dir` is `img/posts`.

To change where you have your posts saved or where you want to save your image:

```
flickr-to-jekyll --posts_dir='notes/_posts --img_dir='notes/img/posts' '
```
