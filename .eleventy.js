const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require('html-minifier');
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  const buildTimestamp = Date.now();


  eleventyConfig.addPassthroughCopy('CNAME');

  eleventyConfig.setBrowserSyncConfig({
    files: './public/styles/**/*.css'
  });

  eleventyConfig.addPassthroughCopy('src/static');

  eleventyConfig.addFilter('formatDate', (isoDate) => {
    return DateTime.fromISO(isoDate, { zone: 'utc+2' }).toLocaleString(DateTime.DATE_FULL);
  });

  eleventyConfig.addFilter('recentPosts', (posts, limit = 1) => {
    (posts ?? []).sort((a, b) => DateTime.fromISO(a.date).toUnixInteger() - DateTime.fromISO(b.date).toUnixInteger())

    return posts.slice(0, limit)
  });

  eleventyConfig.addFilter('randomPost', (posts) => {
    (posts ?? []).sort(() => 0.5 - Math.random())

    return posts.slice(0, 1)
  });

  eleventyConfig.addFilter('featuredPost', (posts) => {
    const featuredPosts = [...(posts ?? []).filter(post => !!post?.title)]
    featuredPosts.sort(() => 0.5 - Math.random())

    return featuredPosts.slice(0, 1)
  });

  eleventyConfig.addFilter('sortRandomly', (data) => {
    return (data ?? []).sort(() => 0.5 - Math.random())
  });

  eleventyConfig.addFilter('buildUrl', (path, addTimestamp = false) => {
    const timestampParam = addTimestamp ? `?v=${buildTimestamp}` : '';
    const websiteUrl = process.env.ELEVENTY_ENV === 'production' ? `https://maarten.be${path}` : path

    return `${websiteUrl}${timestampParam}`;
  });

  eleventyConfig.addFilter('buildMetaImage', (image) => {
    return image ? `'https://maarten.be/static/meta/articles/${image}?v=${buildTimestamp}` : ''
  });

  eleventyConfig.addFilter('formatHashtags', (tags) => {
    return (tags ?? []).map(tag => `#${tag}`).join(' ');
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addShortcode("age", () => `${new Date().getFullYear() - 1984}`);

  eleventyConfig.addPlugin(syntaxHighlight);

  if (process.env.ELEVENTY_ENV === 'production') {
    eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        const minified = htmlmin.minify(content, {
          collapseInlineTagWhitespace: false,
          collapseWhitespace: true,
          removeComments: true,
          sortClassName: true,
          useShortDoctype: true,
        });

        return minified;
      }

      return content;
    });
  }

  return {
    dir: {
      input: "src",
      output: "public"
    }
  }
}
