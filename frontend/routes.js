const routes = require('next-routes');

module.exports = routes()
  .add('clock')
  .add('createProposal', '/proposals/new', 'editor')
  .add('proposal', '/proposals/:id', 'proposal')
  .add('proposals');
