function SearchView(locator, searchApi) {
  this.element = $(locator);
  var self = this;
  this.element.find('.search_query').on('change', function() {
    searchApi.search($(this).val()).done(function(results) {
      $.each(results, function(i, result) {
        self.resultsElement.append('<h1><a href="' + result.url +'">' + result.title + '</a></h1>');
      });
    });
  });
  this.resultsElement = this.element.find('.results');

}
describe('SearchView', function () {
  it('should search when the search field changes', function () {
    var searchPage = affix('#search_page');
    var results = searchPage.affix('.results');
    var searchQuery = searchPage.affix('input.search_query');
    var searchApi = {
      search: function(query) {
        return {
          done: function(callback) {
            callback([{
              title: "Yo momma",
              url: "http://yomomma.example.com"
            }, {
              title: "Yo dadda",
              url: "http://yodadda.example.com"
            } ]);
          }
        }
      }
    };
   var searchView = new SearchView('#search_page', searchApi);
   searchQuery.val('Yo');
   searchQuery.trigger('change');
   expect(results).toContainText("Yo momma");
   expect(results).toContainText("Yo dadda");
  });
});

var SearchApi = function() {

}

SearchApi.prototype.search = function(query) {
  var promise = $.Deferred();
  $.get('/search', { "query": query }).done(function(results) {
    promise.resolve(results.search_results);
  });
  return promise;
}
describe('SearchApi', function() {

  var server, callback;
  beforeEach(function() {
    server = sinon.fakeServer.create();
  });
  it("gets the /search with the query as the data", function() {
    var searchApi = new SearchApi();
    callback = function(results) {
      expect(results[0].title).toEqual("Hi");
      expect(results[0].url).toEqual("http://hi.example.com");
    }

    searchApi.search("hi mom").done(callback);

    expect(server.requests[0].url).toEqual("/search?query=hi+mom");
    server.requests[0].respond(200, { "Content-Type": "application/json" },
      JSON.stringify({ search_results: [{ title: "Hi", url: "http://hi.example.com"}]})
    );
  });


  afterEach(function() {
    server.restore();
  });
});

