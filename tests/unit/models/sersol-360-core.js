describe("SerSol 360 Core Model >", function() {
  var serSol360Core = {}, journalResponse = {}, scope = {}, titles = [];

  beforeEach(function() {
    serSol360Core = browzine.serSol360Core;

    var searchResults = $("<html><body><div class='container-fluid'><div ui-view='searchResults'><div class='results-title-data'></div></div></div></body></html>");

    inject(function ($compile, $rootScope) {
      $scope = $rootScope.$new();

      $scope.searchResultsCtrl = {
        titleData: {
          titles: [
            {
              title: "The New England journal of medicine",
              syndeticsImageUrl: "https://secure.syndetics.com/index.aspx?isbn=/mc.gif&issn=0028-4793&client=mistatesum",
              identifiers: [{type: "ISSN", value: "0028-4793"}, {type: "eISSN", value: "1533-4406"}]
            },

            {
              title: "The New England journal of medicine and surgery",
              syndeticsImageUrl: "https://secure.syndetics.com/index.aspx?isbn=/mc.gif&issn=2163-307X&client=mistatesum",
              identifiers: [{type: "eISSN", value: "2163-307X"}]
            },

            {
              title: "Diamond deposits : origin, exploration, and history of discovery",
              syndeticsImageUrl: "https://secure.syndetics.com/index.aspx?isbn=9780873352130/mc.gif&client=mistatesum&freeimage=true",
              identifiers: [{type: "ISBN", value: "9780873352130"}, {type: "eISBN", value: "9780873352130"}, {type: "eISBN", value: "9780873352789"}]
            }
          ]
        }
      };

      searchResults = $compile(searchResults)($scope);
    });

    scope = serSol360Core.getScope(searchResults);
    titles = serSol360Core.addTargets(serSol360Core.getTitles(scope));

    journalResponse = {
      "data": [{
        "id": 10292,
        "type": "journals",
        "title": "New England Journal of Medicine (NEJM)",
        "issn": "00284793",
        "sjrValue": 14.619,
        "coverImageUrl": "https://assets.thirdiron.com/images/covers/0028-4793.png",
        "browzineEnabled": true,
        "browzineWebLink": "https://browzine.com/libraries/XXX/journals/10292"
      }]
    };
  });

  it("serSol360Core model should exist", function() {
    expect(serSol360Core).toBeDefined();
  });

  describe("serSol360Core model getScope method >", function() {
    it("should retrieve the scope from a search result", function() {
      expect(scope).toBeDefined();
      expect(scope.searchResultsCtrl).toBeDefined();
      expect(scope.searchResultsCtrl.titleData).toBeDefined();
      expect(scope.searchResultsCtrl.titleData.titles).toBeDefined();

      expect(scope.searchResultsCtrl.titleData.titles[0].title).toEqual("The New England journal of medicine");
      expect(scope.searchResultsCtrl.titleData.titles[0].syndeticsImageUrl).toEqual("https://secure.syndetics.com/index.aspx?isbn=/mc.gif&issn=0028-4793&client=mistatesum");
    });
  });

  describe("serSol360Core model getQueryVariable method >", function() {
    it("should extract an issn from syndeticsImageUrl", function() {
      var syndeticsImageUrl = titles[0].syndeticsImageUrl;
      var issn = serSol360Core.getQueryVariable(syndeticsImageUrl, "issn");
      expect(issn).toEqual("0028-4793");
    });

    it("should return empty string when no issn is available on syndeticsImageUrl", function() {
      var syndeticsImageUrl = titles[2].syndeticsImageUrl;
      var issn = serSol360Core.getQueryVariable(syndeticsImageUrl, "issn");
      expect(issn).toEqual("");
    });
  });

  describe("serSol360Core model shouldEnhance method >", function() {
    it("should not enhance a search result without an issn", function() {
      var issn = '';
      expect(serSol360Core.shouldEnhance(issn)).toEqual(false);
    });

    it("should enhance a journal search result with an issn", function() {
      var title = titles[0];
      expect(title.shouldEnhance).toEqual(true);
    });

    it("should enhance a journal search result with only an eIssn", function() {
      var title = titles[1];
      expect(title.shouldEnhance).toEqual(true);
    });

    it("should not enhance a journal search result without an issn or eissn", function() {
      var title = titles[2];
      expect(title.shouldEnhance).toEqual(false);
    });
  });

  describe("serSol360Core model getEndpoint method >", function() {
    it("should build a journal endpoint for a journal search result", function() {
      var title = titles[0];
      expect(title.endpoint).toContain("search?issns=00284793");
    });

    it("should select the issn over the eissn when a journal search result includes both", function() {
      var title = titles[0];
      expect(title.endpoint).toContain("search?issns=00284793");
    });

    it("should select the eissn when the journal search result has no issn", function() {
      var title = titles[1];
      expect(title.endpoint).toContain("search?issns=2163307X");
    });
  });

  describe("serSol360Core model getBrowZineWebLink method >", function() {
    it("should include a browzineWebLink in the BrowZine API response for a journal", function() {
      var data = serSol360Core.getData(journalResponse);
      expect(data).toBeDefined();
      expect(serSol360Core.getBrowZineWebLink(data)).toEqual("https://browzine.com/libraries/XXX/journals/10292");
    });
  });

  describe("serSol360Core model getCoverImageUrl method >", function() {
    it("should include a coverImageUrl in the BrowZine API response for a journal", function() {
      var data = serSol360Core.getData(journalResponse);
      expect(data).toBeDefined();
      expect(serSol360Core.getCoverImageUrl(data)).toEqual("https://assets.thirdiron.com/images/covers/0028-4793.png");
    });
  });

  describe("serSol360Core model buildTemplate method >", function() {
    it("should build an enhancement template for journal search results", function() {
      var data = serSol360Core.getData(journalResponse);
      var browzineWebLink = serSol360Core.getBrowZineWebLink(data);
      var template = serSol360Core.buildTemplate(browzineWebLink);

      expect(data).toBeDefined();
      expect(browzineWebLink).toBeDefined();
      expect(template).toBeDefined();

      expect(template).toEqual("<div class='browzine' style='margin: 5px 0;'><img class='browzine-book-icon' src='https://s3.amazonaws.com/thirdiron-assets/images/integrations/browzine_open_book_icon.png' style='margin-top: -3px;'/> <a class='browzine-web-link' href='https://browzine.com/libraries/XXX/journals/10292' target='_blank' style='font-weight: 300;'>View Journal in BrowZine</a></div>");
      expect(template).toContain("View Journal in BrowZine");
      expect(template).toContain("https://browzine.com/libraries/XXX/journals/10292");
      expect(template).toContain("https://s3.amazonaws.com/thirdiron-assets/images/integrations/browzine_open_book_icon.png");
      expect(template).toContain("margin: 5px 0;");
      expect(template).toContain("margin-top: -3px;");
      expect(template).toContain("font-weight: 300;");
    });
  });
});