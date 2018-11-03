const fs = require('fs');
const path = require('path');
const Flickr = require('flickrapi');
const request = require('request');
const queue = require('d3-queue').queue;

module.exports.saver = (options, context, callback) => {
  if (!process.env.FLICKR_KEY || !process.env.FLICKR_SECRET) {
    throw new Error('Flickr API key and secret must be set in .env');
  }

  Flickr.authenticate(
    {
      api_key: process.env.FLICKR_KEY,
      secret: process.env.FLICKR_SECRET
    },
    (err, flickr) => {
      if (err) return callback(err);
      Promise.all(
        module.exports.getPosts().map(post => {
          return module.exports.savePhotos(flickr, post);
        })
      )
        .then(res => callback(null, res.join('\n')))
        .catch(err => callback(err));
    }
  );
};

// get directories in a given path
module.exports.getDir = src =>
  fs
    .readdirSync(src)
    .filter(file => fs.statSync(path.join(src, file)).isDirectory());

// return post content
module.exports.readPost = filename =>
  fs.readFileSync(filename).toString('utf8');

module.exports.getPosts = () => {
  // check root folder for posts
  const inRoot = module.exports.postsInRoot();
  // check sub directories for posts
  const inSubDirs = module.exports.postsInSubDirs();
  return inSubDirs.concat(inRoot);
};

// check root folder for posts
module.exports.postsInRoot = () => {
  const files = fs.readdirSync(`${process.env.POSTS_DIR}`),
    filterPosts = files.filter(f => {
      const isFile = fs
        .statSync(path.join(`${process.env.POSTS_DIR}/`, f))
        .isFile();
      return isFile && f[0] !== '.';
    });
  return filterPosts
    ? filterPosts.map(p => `${process.env.POSTS_DIR}/${p}`)
    : [];
};

// check sub directories for posts
module.exports.postsInSubDirs = () => {
  return module.exports
    .getDir(`${process.env.POSTS_DIR}/`)
    .reduce((posts, dir) => {
      const files = fs.readdirSync(`${process.env.POSTS_DIR}/` + dir + '/'),
        filterPosts = files.filter(f => f[0] !== '.');
      filterPosts.forEach(p =>
        posts.push(`${process.env.POSTS_DIR}/${dir}/${p}`)
      );
      return posts;
    }, []);
};

// figures out which photos need to be saved and processes them
module.exports.savePhotos = (flickr, post) => {
  const content = module.exports.readPost(post),
    title = module.exports.processTitle(post),
    photos = module.exports.processURLs(content);

  if (photos.length > 0) {
    return module.exports
      .queuePhotos(flickr, photos, title)
      .then(swaps => module.exports.updatePhotoPaths(swaps, content)) // swap out old image URLs for new ones
      .then(draft => module.exports.writeFile(post, draft, title)) // update post
      .then(() => `✅  Downloaded images and updated file paths for ${title}`) // success!
      .catch(err => err);
  } else {
    return `No images to download for ${title}`;
  }
};

module.exports.queuePhotos = (flickr, photos, title) => {
  return new Promise((resolve, reject) => {
    const q = queue(1);
    photos.forEach((photo, index) => {
      const ext = module.exports.processExt(photo),
        filename = module.exports.processFileName(title, ext, index);
      q.defer(module.exports.getPhoto, flickr, filename, photo);
    });

    q.awaitAll((err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// replaces Flickr URLs in Jekyll post with relative ones
module.exports.updatePhotoPaths = (swaps, content) => {
  return new Promise(resolve => {
    let draft = content;
    swaps.map(swap => {
      const re = new RegExp(swap.old, 'g');
      draft = draft.replace(re, `/${swap.new}`);
    });
    resolve(draft);
  });
};

// writes the Jekyll post with the updated photo paths
module.exports.writeFile = (post, draft, title) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(post, draft, 'utf8', err => {
      if (err) return reject(err);
      else {
        resolve(`Updated ${title}`);
      }
    });
  });
};

// figures out Flickr original url and downloads it
module.exports.getPhoto = (flickr, filename, url, callback) => {
  return module.exports
    .getOriginal(flickr, url)
    .then(originalUrl =>
      module.exports.downloadOriginal(originalUrl, url, filename)
    )
    .then(data => callback(null, data))
    .catch(err => callback(err));
};

// returns the photo_id for a Flickr photo based on its URL
module.exports.processPhotoID = url =>
  url
    .split('/')
    .pop()
    .split('_')[0];

// returns the URL for the original photo size uploaded to Flickr
module.exports.getOriginal = (flickr, url) => {
  return new Promise((resolve, reject) => {
    flickr.photos.getSizes(
      {
        api_key: flickr.options.api_key,
        authenticated: true,
        photo_id: module.exports.processPhotoID(url)
      },
      (err, res) => {
        if (err || !res) return reject(err);
        resolve(res.sizes.size.filter(s => s.label == 'Original')[0].source);
      }
    );
  });
};

// requests and save original image file locally
const download = (url, filename) => {
  return new Promise((resolve, reject) => {
    const stream = request.get(url).pipe(fs.createWriteStream(filename));
    stream.on('finish', err => {
      if (err) return reject(err);
      console.log(`Downloaded ${url}`);
      resolve();
    });
  });
};

// downloads the original photo size that was uploaded to Flickr
module.exports.downloadOriginal = (originalUrl, url, filename) => {
  return download(originalUrl, filename)
    .then(() => {
      return {
        old: url,
        new: filename
      };
    })
    .catch(err => err);
};

// returns a title based on the Jekyll post's filename to be used for renaming the Flickr photos found within the posts
module.exports.processTitle = post =>
  post
    .split('/')
    .pop()
    .split('.')[0];

// returns an array of Flickr URLs found in a given Jekyll post
module.exports.processURLs = content => {
  const urls = content.match(
    /(http)?s?:?(\/\/[^"'\n]*\.(?:png|jpg|jpeg|gif))/g
  );
  let flickrUrls = [];
  if (urls) {
    // make unique and return only flickr urls
    const uniq = urls.filter((item, i, ar) => ar.indexOf(item) === i);
    flickrUrls = uniq.filter(item => item.indexOf('flickr') > -1);
  }
  return flickrUrls;
};

// returns the photo's extention based on the Flickr URL in the Jekyll post
module.exports.processExt = url => url.match(/[^.]+$/g)[0];

// returns a new filename for the photo that was downloaded from Flickr
module.exports.processFileName = (title, ext, i) =>
  `${process.env.IMG_DIR}/${title}-${i}.${ext}`;
