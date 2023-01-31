import { compile } from 'ejs';

export const pageTemplate = compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,600,700,700i,800&display=swap&subset=cyrillic">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system,BlinkMacSystemFont,'Source Sans Pro',"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,Arial,sans-serif;
      margin: 0;
    }
  </style>
  <% if (assets.criticalCss) { %>
    <link rel="stylesheet" href="<%= assets.criticalCss %>">
  <% } %>
  <% if (assets.css) { %>
    <link rel="stylesheet" href="<%= assets.css %>">
  <% } %>
  <% if (assets.criticalJs) { %>
    <script src="<%= assets.criticalJs %>"></script>
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
