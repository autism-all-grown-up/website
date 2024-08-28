Page as slots:

- nav
- banner
- tag
- breadcrumbs
- main
- footer

Process:
1. Capture menu click
2. Parse url to get page
3. Router
   1. consults dictionary that matches
      page to slots and actions.
   2. Runs actions
   3. Updates history and url

updateSlot(url, slot_id, template, action, data) {
    cached = cache_db[url];

    if (cached)
    {
        result = loadCached(url);
    }
    else
    {
        template = loadTemplate(template);
        result = action(template, data);
    }
    
    slots[slot_id].innerHTML = result.
}

Load random page:
Options:
1. Load cached
2. Render on server
3. Render client side

Update page
1. Load new page
2. Update with content rendered on server
3. Update with cached content
4. Update with content rendered on client


