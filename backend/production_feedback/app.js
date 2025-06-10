// Import necessary packages and files
const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const schema = require('./path/to/your/schema'); // Adjust the path to your schema

const app = express();

// Use graphql-http for handling GraphQL requests
app.use('/graphql', createHandler({
  schema: schema,
  context: (req) => ({ req }),
}));

// Optional: Set up a route for GraphiQL interface
app.use('/graphiql', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>GraphiQL</title>
        <link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />
      </head>
      <body style="margin: 0;">
        <div id="graphiql" style="height: 100vh;"></div>
        <script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
        <script>
          const fetcher = GraphiQL.createFetcher({ url: '/graphql' });
          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher }),
            document.getElementById('graphiql'),
          );
        </script>
      </body>
    </html>
  `);
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});