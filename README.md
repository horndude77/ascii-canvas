## About
My goal is be able to make some simple games or graphical object interactions
using ascii tile-based graphics. Think something like
[ZZT](http://en.wikipedia.org/wiki/ZZT). This is just a start.

## Tile sets
Tiles have a character (based on extended ascii or [code page
473](http://en.wikipedia.org/wiki/Code_page_437)), a foreground color, and a
background color. A tile set is an image of 16x16 tiles defining each
character. When rendering a character magenta pixels become background, white
pixels become foreground, gray pixels become darker foreground, and any other
color stays that color in the final tile. I believe this works similar to Dwarf
Fortress tile sets. See
[here](http://magmawiki.com/index.php/Tileset_repository) for more tilesets.

## Running locally
There are some security issues which prevent running right from the file
system. It must be run from a webserver. For quickly getting it to work use
something like `python -m SimpleHTTPServer`.

## Why?
I mostly made this in order to understand javascript at a rudimentary level.
