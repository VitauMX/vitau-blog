const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // Query data for pages
  const result = await graphql(`
    {
      allGhostPost {
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
  const posts = result.data.allGhostPost.edges

  // Load templates
  // const tagsTemplate = path.resolve(`./src/templates/tag.js`);
  const postTemplate = path.resolve(`./src/templates/post/Post.js`)

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
      },
    })
  })
}
