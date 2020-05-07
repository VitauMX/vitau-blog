import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"

// import Layout from "../components/layout"
import Layout from "../components/layout/Layout"
import SEO from "../components/seo"

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      allGhostPost(sort: { order: DESC, fields: published_at }) {
        edges {
          node {
            title
            slug
            reading_time
            created_at
            published_at
          }
        }
      }
    }
  `)

  const posts = data.allGhostPost.edges

  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>

      <section>
        {posts.map(({ node }, i) => (
          <Link to={`/${node.slug}`} key={i}>
            <p>{node.title}</p>
            <p>{node.created_at}</p>
          </Link>
        ))}
      </section>
    </Layout>
  )
}

export default IndexPage
