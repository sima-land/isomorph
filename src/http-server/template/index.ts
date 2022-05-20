import { compile } from 'ejs';

export const pageTemplate = compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <style>
    * {
      margin: 0;
      padding: 0;
      border: 0;
      outline: 0;
      box-sizing: border-box;
      font: inherit;
      line-height: inherit;
    }
  </style>
  <% if (assets.css) { %>
    <link rel="stylesheet" href="<%= assets.css %>">
  <% } %>
</head>
<body>
  <%- markup %>
  <% if (assets.js) { %>
    <script src="<%= assets.js %>"></script>
  <% } %>
</body>
</html>
`);
