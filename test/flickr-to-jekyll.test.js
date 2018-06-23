'use strict';

const savr = require('../index.js');
const test = require('tape');

process.env.IMG_DIR = 'example/img/posts';
process.env.POSTS_DIR = 'example/_posts';

const content =
  '---\ntitle: Raspberry Butter Cream Macarons\nimage: https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg\n---\n\n\nI decided to clear out my [baking bucket list](https://katydecorah.com/cool-image.jpg) and tackle all the time-consuming desserts I’ve been itching to make. My first conquest: the French macaron.\n\n![Macarons](https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg)\n';

// [readPost]
test('[readPost]', assert => {
  assert.equal(
    savr.readPost('example/_posts/sweet-stuff/2018-04-25-macarons.md'),
    '---\ntitle: Raspberry Butter Cream Macarons\nimage: https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg\n---\n\n\nI decided to clear out my baking bucket list and tackle all the time-consuming desserts I’ve been itching to make. My first conquest: the French macaron.\n\n![Macarons](https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg)\n'
  );
  assert.end();
});

// TODO: [savePhotos]

// [downloadOriginal]
test('[downloadOriginal]', assert => {
  return savr
    .downloadOriginal(
      'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg',
      'https://farm5.staticflickr.com/4628/39221886244_b0076f50f4_o.jpg',
      'example/img/posts/2018-04-25-macarons-1.jpg'
    )
    .then(res => {
      assert.deepEqual(res, {
        old: 'https://farm5.staticflickr.com/4628/39221886244_b0076f50f4_o.jpg',
        new: 'example/img/posts/2018-04-25-macarons-1.jpg'
      });
      assert.end();
    });
});

// TODO: [getOriginal]

// TODO: [getPhoto]

// [getPosts]
test('[getPosts]', assert => {
  assert.deepEqual(savr.getPosts(), [
    'example/_posts/sweet-stuff/2018-04-25-macarons.md',
    'example/_posts/sweet-stuff/2018-04-27-crepe-cake.md',
    'example/_posts/2018-04-26-donuts.md',
    'example/_posts/2018-04-28-test.md',
    'example/_posts/2018-04-29-test.md',
    'example/_posts/2018-04-30-test.md'
  ]);
  assert.end();
});

// [postsInRoot]
test('[postsInRoot]', assert => {
  assert.deepEqual(savr.postsInRoot(), [
    'example/_posts/2018-04-26-donuts.md',
    'example/_posts/2018-04-28-test.md',
    'example/_posts/2018-04-29-test.md',
    'example/_posts/2018-04-30-test.md'
  ]);
  assert.end();
});

// [postsInSubDirs]
test('[postsInSubDirs]', assert => {
  assert.deepEqual(savr.postsInSubDirs(), [
    'example/_posts/sweet-stuff/2018-04-25-macarons.md',
    'example/_posts/sweet-stuff/2018-04-27-crepe-cake.md'
  ]);
  assert.end();
});

// [updatePhotoPaths]
test('[updatePhotoPaths]', assert => {
  return savr
    .updatePhotoPaths(
      [
        {
          old:
            'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg',
          new: 'example/img/posts/2018-04-25-macarons-0.jpg'
        }
      ],
      content
    )
    .then(res => {
      assert.equal(
        res,
        '---\ntitle: Raspberry Butter Cream Macarons\nimage: /example/img/posts/2018-04-25-macarons-0.jpg\n---\n\n\nI decided to clear out my [baking bucket list](https://katydecorah.com/cool-image.jpg) and tackle all the time-consuming desserts I’ve been itching to make. My first conquest: the French macaron.\n\n![Macarons](/example/img/posts/2018-04-25-macarons-0.jpg)\n'
      );
      assert.end();
    });
});

// [getDir]
test('[getDir]', assert => {
  assert.deepEqual(savr.getDir('example/_posts/'), ['sweet-stuff']);
  assert.end();
});

// [processTitle]
test('[processTitle] return file name without directories and file extention', assert => {
  assert.equal(
    savr.processTitle('example/_posts/sweet-stuff/2018-04-25-macarons.md'),
    '2018-04-25-macarons'
  );
  assert.equal(
    savr.processTitle('example/_posts/sweet-stuff/2018-04-25-macarons.html'),
    '2018-04-25-macarons'
  );
  assert.equal(
    savr.processTitle('example/_posts/2018-04-25-macarons.html'),
    '2018-04-25-macarons'
  );
  assert.end();
});

// [processURLs]
test('[processURLs] return flickr urls', assert => {
  assert.deepEqual(savr.processURLs(content), [
    'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg'
  ]);
  assert.end();
});

// [processExt]
test('[processExt] return file extention', assert => {
  assert.equal(
    savr.processExt(
      'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg'
    ),
    'jpg'
  );
  assert.equal(
    savr.processExt(
      'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.gif'
    ),
    'gif'
  );
  assert.equal(
    savr.processExt(
      'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.png'
    ),
    'png'
  );
  assert.equal(
    savr.processExt(
      'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpeg'
    ),
    'jpeg'
  );
  assert.end();
});

// [processFileName]
test('[processFileName] return new filename', assert => {
  assert.equal(
    savr.processFileName('2018-04-25-macarons', 'gif', '0'),
    'example/img/posts/2018-04-25-macarons-0.gif'
  );
  assert.equal(
    savr.processFileName('2018-04-25-macarons', 'jpg', '1'),
    'example/img/posts/2018-04-25-macarons-1.jpg'
  );
  assert.end();
});

// [processPhotoID]
test('[processPhotoID] return photo_id', assert => {
  assert.equal(
    savr.processPhotoID(
      'https://c1.staticflickr.com/5/4628/39221886244_d31cf256ed_b.jpg'
    ),
    '39221886244'
  );
  assert.end();
});

// [writeFile]
test('[writeFile]', assert => {
  return savr
    .writeFile(
      'example/_posts/sweet-stuff/2018-04-25-macarons.md',
      'new content',
      '2018-04-25-macarons'
    )
    .then(res => {
      assert.deepEqual(res, 'Updated 2018-04-25-macarons');
      assert.end();
    });
});
