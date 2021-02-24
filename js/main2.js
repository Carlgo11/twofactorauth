/* jshint esversion: 6 */

// Open/close the card on a left click inside it.
function toggleCard( event )
{
  var elem = event.target;
  while( !elem.classList.contains('card') )
    elem = elem.parentElement;
  elem.classList.toggle('opened');
}

// Clicking on the link should not trigger "toggleCard".
function followLink( event )
{
  event.stopPropagation();
}

// Helper function
function escape( html )
{
  return html.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

// The raw JSON data and the (sorted) entry IDs.
var jsonData;
var ids = [];

var keywords = [];
var regions = [];
var methods = [];

var lazyLoad;

function createCards()
{
  var keywordsSet = new Set();
  var regionsSet = new Set();
  var methodsSet = new Set();

  ids = Object.keys(jsonData);
  for( var id of ids )
  {
    var entry = jsonData[id];

    if( entry.keywords )
    {
      entry.keywords.sort();
      for( const kw of entry.keywords )
	keywordsSet.add(kw);
    }

    if( entry.tfa )
    {
      entry.tfa.sort();
      for( const tfa of entry.tfa )
	methodsSet.add(tfa);
    }

    if( entry.regions )
    {
      entry.regions.sort();
      for( const reg of entry.regions )
	regionsSet.add(reg);
    }
  }

  ids.sort( function(l,r) { return l.toLowerCase().localeCompare(r.toLowerCase()); } );

  keywords = [...keywordsSet];
  keywords.sort();

  regions = [...regionsSet];
  regions.sort();

  methods = [...methodsSet];
  methods.sort();

  const tfaIcons = new Map( [
    [ "call", "phone" ],
    [ "custom-hardware", "microchip" ],
    [ "custom-software", "mobile-alt" ],
    [ "email", "envelope" ],
    [ "sms", "sms" ],
    [ "totp", "hourglass-half" ],
    [ "u2f", "key" ],
  ] );

  const squareFlags = [ "ch" ];

  var divCards = document.getElementById("cards");
  var tfaCount = 0;
  for( id of ids )
  {
    const entry = jsonData[id];
    const rank = entry.tfa ? "a" : "f"; // XXX proper rank evaluation missing
    if( entry.tfa )
      ++tfaCount;

    var divCard = document.createElement("div");
    divCard.classList = "card rank-" + rank;
    divCard.id = "entry-" + id;

    var content = "<div class='wrapper-logo-links'>";

    const real_img = entry.img ? entry.img : entry.domain+".svg";
    content += "<div class='logo'><img class='logo lazy' data-src='img/"+ real_img.substring(0,1) + "/" + real_img + "'></div>";

    const real_url = entry.url ? entry.url : "https://"+entry.domain;
    content += "<div class='wrapper-links'>";
    content += "<div class='name'><a href='" + real_url + "'>" + escape(id) + "</a></div>";
    content += "<div class='url'><a href='" + real_url + "'>" + real_url + "</a></div>";
    content += "<div class='keywords'>" + entry.keywords.join(", ") + "</div>";
    if( entry.documentation )
      content += "<div class='doc'><a href='" + entry.documentation  + "'>Documentation</a></div>";
    content += "</div>"; // wrapper-links

    content += "</div>"; // wrapper-logo-links

    content += "<div class='wrapper-icons'>";
    content += "<div class='methods'>";
    if( entry.tfa )
      for( var tfa of entry.tfa )
	content += "<i class='tfa-icon fas fa-" + tfaIcons.get(tfa) + "' title='" + tfa + "'></i>";
    content += "</div>";
    content += "<div class='regions'>";
    if( entry.regions )
      for( var region of entry.regions )
	content += "<i class='flag-icon flag-icon-" + region + ( squareFlags.includes(region) ? " flag-icon-squared" : "" ) + "' title='" + region + "'></i>";
    content += "</div>";
    content += "</div>"; // wrapper-icons

    content += "<div class='rank'>" + rank.toUpperCase() + "</div>";

    divCard.innerHTML = content;
    divCards.appendChild(divCard);
  }

  var i;

  const allCards = document.querySelectorAll("div.card");
  for( i = 0; i < allCards.length; ++i )
    allCards[i].addEventListener("click",toggleCard);

  const allLinks = document.querySelectorAll("a");
  for( i = 0; i < allLinks.length; ++i )
    allLinks[i].addEventListener("click",followLink);

  lazyLoad = new LazyLoad( { elements_selector: ".lazy" } );

  var infoContent = "This list of websites contains " + allCards.length + " entries in total, " + tfaCount + " of which support some variant of two-factor authentication.";
  document.getElementById("info").innerHTML = infoContent;
}

// Searching the data
var inputSearch;
var filterKeyword;
var filterRegion;
var filterMethod;

function getOptions( id )
{
  var result = new Set();
  for( var opt of document.getElementById(id).options )
    if( opt.selected )
      result.add( opt.value );

  return result;
}

function onSearch()
{
  const searchText = inputSearch.value.toLowerCase();
  const selectedKeywords = getOptions("filterKeyword");
  const selectedRegions = getOptions("filterRegion");
  const selectedMethods = getOptions("filterMethod");

  if( typeof(Storage) !== "undefined" )
  {
    localStorage.setItem( "search", searchText );
    localStorage.setItem( "filterKeyword", JSON.stringify( [...selectedKeywords.keys()] ) );
    localStorage.setItem( "filterRegion", JSON.stringify( [...selectedRegions.keys()] ) );
    localStorage.setItem( "filterMethod", JSON.stringify( [...selectedMethods.keys()] ) );
  }

  var id;
  if( selectedKeywords.size == 0 && selectedRegions.size == 0 && selectedMethods.size == 0 && searchText.length == 0 )
  {
    for( id of ids )
      document.getElementById( "entry-"+id ).style.display = "none";

    document.getElementById("info").style.display = "block";
    document.getElementById("no-match").style.display = "none";
    return;
  }

  var zebra = false;
  var hits = [];
  for( id of ids )
  {
    const entry = jsonData[id];
    const elemId = "entry-"+id;
    var card = document.getElementById(elemId);
    card.classList.remove("opened");

    var match = true;

    if( searchText.length > 0 && !id.toString().toLowerCase().includes(searchText) && !entry.domain.toString().toLowerCase().includes(searchText) )
      match = false;

    if( match && selectedKeywords.size > 0 )
      if( entry.keywords.filter( v => selectedKeywords.has(v) ).length == 0 )
	match = false;

    if( match && selectedRegions.size > 0 )
      if( !entry.regions || entry.regions.filter( v => selectedRegions.has(v) ).length == 0 )
	match = false;

    if( match && selectedMethods.size > 0 )
      if( !entry.tfa || entry.tfa.filter( v => selectedMethods.has(v) ).length == 0 )
	match = false;

    if( match )
    {
      card.style.display = "flex";
      hits.push(elemId);

      if( zebra )
	card.classList.add("zebra");
      else
	card.classList.remove("zebra");
      zebra = !zebra;
    }
    else
      card.style.display = "none";
  }

  if( hits.length <= 3 )
    for( id of hits )
      document.getElementById(id).classList.add("opened");

  document.getElementById("no-match").style.display = ( hits.length == 0 ) ? "block" : "none";
  document.getElementById("info").style.display = "none";
}

// Set up the filter area
function addOptions( id, options )
{
  var selObject = document.getElementById(id);
  for( const opt of options )
  {
    var option = document.createElement("option");
    option.value = opt;
    option.text = opt;
    selObject.add(option);
  }
}

function fillSelectOptions()
{
  addOptions( "filterKeyword", keywords );
  addOptions( "filterRegion", regions );
  addOptions( "filterMethod", methods );
}

function loadSelectOptions( id )
{
  const options = JSON.parse( localStorage.getItem(id) );
  if( options )
    for( var opt of document.getElementById(id).options )
      opt.selected = options.includes( opt.value );
}

function loadStorage()
{
  const storageSearch = localStorage.getItem( "search" );
  if( storageSearch )
    inputSearch.value = storageSearch;

  loadSelectOptions("filterKeyword");
  loadSelectOptions("filterRegion");
  loadSelectOptions("filterMethod");
}

function initPage()
{
  inputSearch = document.getElementById("search");
  inputSearch.addEventListener( "input", function(){ onSearch(); } );
  filterKeyword = document.getElementById("filterKeyword");
  filterKeyword.addEventListener( "change", function(){ onSearch(); } );
  filterRegion = document.getElementById("filterRegion");
  filterRegion.addEventListener( "change", function(){ onSearch(); } );
  filterMethod = document.getElementById("filterMethod");
  filterMethod.addEventListener( "change", function(){ onSearch(); } );

  createCards();
  fillSelectOptions();

  if( typeof(Storage) !== "undefined" )
    loadStorage();

  const urlParams = new URLSearchParams( window.location.search );
  if( urlParams.has("s") )
    inputSearch.value = urlParams.get("s");

  onSearch();
}

// Loading the data from the JSON API file
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if( this.readyState == 4 && this.status == 200 )
  {
    jsonData = JSON.parse( this.responseText );
    initPage();
  }
};
xmlhttp.open( "GET", "api/v3/all.json", true );
xmlhttp.send();
