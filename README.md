---
title: "NOTES"
author: "Ariel Balter"
---

# User Guide
I had a [pretty comprehensive guide](./old_readme.md) at one point. But then I made major changes---too many to update the guide.

I need to write a new guide.

# Plan
Right now the system works well. Maybe I can divide the things I want to work on into refinements, enhancements, and optimizations.

## Refinements

### Plugin system
I want to refine and enhance the plugin system. But mostly I need to document and standardize it. Right now there are typically two files. One file contains the meat of the plugin and the other, always called *./plugins/<plugin name>/plugin.js*, imports the main code and handles the issue of modules being either UMD or ESM. That seems redundant, but it's what is working right now.

### The *config.json* file
Right now the router looks in the directory specified in the URL for a *config.json* which it follows in order to render the page. I can see two ways to improve this situation:

1. Use *config.js* because the overhead of loading a Javascript file *might* be less than parsing a JSON file.
1. Put the data into a YAML header so as to have a **single** file.

The 2nd idea sounds super clean but probably isn't flexible enough. When there is only a single markdown file it would be fine. When there are multiple it could be a problem. Then I can consider a hybrid situation where *some* data is on a config and *some* is in a YAML header.

If I can conceptualize how to make a rigorous distinction between the two types of data then I might consider that.

### More standard plugins
I need more standard plugins for things like tabs, drop-down menus, other types of navigation, cards, blog posts, generated lists, etc.

## Enhancements
### Site Rendering
I would ultimately like to be able to support four different ways of rendering the site:

- 100% client side (CSR)
- 100% server side (SSR)
- Hybrid client/server
- Static build

Right now the CSR is working very well. I see a huge value in being able to build a static site, and believe it should not be hard to do using headless browser technology. Basically just do whatever happens client side and save it locally. That being said, the vast majority of the javascript that is used to render the site in the browser could also run in node on the server. If I can keep the code *extremely* simple, then perhaps hybrid rendering would be relatively straightforward.

I don't currently see much of a use for hybrid or 100% SSR. I would like to implement static site first.

### Academark
I would like to finish academark and use it for page rendering instead of markdown.

### Integrated editing and editing
Right now it is possible to "edit" the site by referring all paths to github! That's almost like having an editing dashboard. But who doesn't want an actual dashboard and editor in their CMS? This is a philosophical point I need to think about. 

## Optimizations
I'm really interested in testing the limits of CSR. Perhaps the entire page can be reduced to plugins. This will get down to optimization.
