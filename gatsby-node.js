const path = require(`path`)
const { samplePosts, sampleCategories } = require('./src/data/samplePosts.js')

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // Query data for pages
  const result = await graphql(`
    {
      allGhostPost(sort: { order: ASC, fields: published_at }) {
        edges {
          node {
            slug
          }
        }
      }
      allGhostTag(sort: { order: ASC, fields: name }) {
        edges {
          node {
            slug
          }
        }
      }
    }
  `)

  // Check for any errors
  if (result.errors) {
    throw new Error(result.errors)
  }

  // Extract query results
  const apiPosts = result.data?.allGhostPost?.edges || []
  const apiCategories = result.data?.allGhostTag?.edges || []

  const posts = apiPosts.length > 0 ? apiPosts : samplePosts.map(post => ({ node: post }))
  const categories = apiCategories.length > 0 ? apiCategories : sampleCategories.map(cat => ({ node: cat }))

  // Load templates
  const postTemplate = path.resolve(`./src/templates/post/Post.js`)
  const categoryTemplate = path.resolve(`./src/templates/category/Category.js`)

  // Create each post page
  posts.forEach(({ node }) => {
    // This part here defines, that our posts will use
    // a `/:slug/` permalink.
    node.url = `/${node.slug}/`

    createPage({
      path: node.url,
      component: postTemplate,
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.slug,
        // For sample data we need to pass the full post object
        samplePost: apiPosts.length === 0 ? node : null,
      },
    })
  })

  // Create each category page
  categories.forEach(({ node }) => {
    // This part here defines, that our categories will use
    // a `/:slug/` permalink.
    node.url = `/${node.slug}/`

    // Get posts for this category (for sample data)
    const categoryPosts = apiPosts.length === 0 
      ? samplePosts
          .filter(post => post.primary_tag.slug === node.slug)
          .map(post => ({ node: post }))
      : []

    createPage({
      path: node.url,
      component: categoryTemplate,
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        slug: node.slug,
        // For sample data we need to pass the full category object and its posts
        sampleCategory: apiPosts.length === 0 ? node : null,
        sampleCategoryPosts: categoryPosts,
      },
    })
  })
}
