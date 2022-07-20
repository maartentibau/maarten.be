const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const htmlmin = require('html-minifier');
const { DateTime } = require('luxon');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

module.exports = function (eleventyConfig) {
  const markdownItOptions = {
    html: true,
  };

  const markdownItAnchorOptions = {
    permalink: true,
    renderPermalink,
  };

  const markdownLib = markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions);

  eleventyConfig.setLibrary('md', markdownLib);

  const buildTimestamp = Date.now();

  eleventyConfig.addPassthroughCopy('CNAME');

  eleventyConfig.setBrowserSyncConfig({
    files: './public/styles/**/*.css',
  });

  eleventyConfig.addPassthroughCopy('src/static');

  eleventyConfig.addFilter('formatDate', (isoDate) => {
    return DateTime.fromISO(isoDate, { zone: 'utc+2' }).toLocaleString(DateTime.DATE_FULL);
  });

  eleventyConfig.addFilter('sortedPosts', (posts, limit = 1) => {
    return sortPosts(publishedPosts(posts));
  });

  eleventyConfig.addFilter('recentPosts', (posts, limit = 1, url = null) => {
    if (url) {
      return sortPosts(publishedPosts(posts))
        .filter((post) => url.indexOf(post.url) === -1)
        .slice(0, limit);
    }

    return sortPosts(publishedPosts(posts)).slice(0, limit);
  });

  eleventyConfig.addFilter('randomPost', (posts, url = null) => {
    if (currentPost) {
      return sortRandomly(publishedPosts(posts))
        .filter((post) => url.indexOf(post.url) === -1)
        .slice(0, limit);
    }

    return sortRandomly(posts).slice(0, 1);
  });

  eleventyConfig.addFilter('featuredPost', (posts) => {
    const featuredPosts = publishedPosts(posts).filter((post) => !!post?.featured);
    featuredPosts.sort(() => 0.5 - Math.random());

    return featuredPosts.slice(0, 1);
  });

  eleventyConfig.addFilter('publishedPosts', (posts) => {
    return publishedPosts(posts);
  });

  eleventyConfig.addFilter('sortRandomly', (data) => {
    return sortRandomly(data);
  });

  eleventyConfig.addFilter('buildUrl', (path, addTimestamp = false) => {
    const timestampParam = addTimestamp ? `?v=${buildTimestamp}` : '';
    const websiteUrl = process.env.ELEVENTY_ENV === 'production' ? `https://maarten.be${path}` : path;

    return `${websiteUrl}${timestampParam}`;
  });

  eleventyConfig.addFilter('buildMetaImage', (image) => {
    return image ? `'https://maarten.be/static/images/posts/${image}?v=${buildTimestamp}` : '';
  });

  eleventyConfig.addFilter('formatHashtags', (tags) => {
    return (tags ?? []).map((tag) => `#${tag}`).join(' ');
  });

  eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`);

  eleventyConfig.addShortcode('age', () => `${new Date().getFullYear() - 1984}`);

  eleventyConfig.addPlugin(syntaxHighlight);

  if (process.env.ELEVENTY_ENV === 'production') {
    eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        return htmlmin.minify(content, {
          collapseInlineTagWhitespace: false,
          collapseWhitespace: true,
          removeComments: true,
          sortClassName: true,
          useShortDoctype: true,
        });
      }

      return content;
    });
  }

  return {
    dir: {
      input: 'src',
      output: 'public',
    },
  };
};

function sortPosts(posts) {
  return ([...posts] ?? [])
    .filter((post) => !!post?.published)
    .sort((a, b) => DateTime.fromISO(b.date).toUnixInteger() - DateTime.fromISO(a.date).toUnixInteger());
}

function sortRandomly(data) {
  return ([...data] ?? []).sort(() => 0.5 - Math.random());
}

function renderPermalink(slug, opts, state, idx) {
  const position = { false: 'push', true: 'unshift' };
  const space = () => Object.assign(new state.Token('text', '', 0), { content: ' ' });

  const linkTokens = [
    Object.assign(new state.Token('link_open', 'a', 1), {
      attrs: [
        ['class', opts.permalinkClass],
        ['href', opts.permalinkHref(slug, state)],
      ],
    }),
    Object.assign(new state.Token('html_block', '', 0), {
      content: `<span aria-hidden="true" class="header-anchor__symbol" title="Direct link to this section"><img src="/static/svg/link.svg" height="20" alt="link icon"></span>`,
    }),
    new state.Token('link_close', 'a', -1),
  ];

  if (opts.permalinkSpace) {
    linkTokens[position[!opts.permalinkBefore]](space());
  }
  state.tokens[idx + 1].children[position[opts.permalinkBefore]](...linkTokens);
}

function publishedPosts(posts) {
  return ([...posts] ?? []).filter((post) => !!post?.published);
}
