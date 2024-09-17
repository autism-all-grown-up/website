## Page has slots:

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

```json
      {
        "default": 
        {
            "load": [
                {
                    "slot": "banner",
                    "template": "templates/banner",
                    "data": "content/banner",
                    "action": "default"
                },
                {
                    "slot": "nav",
                    "template": "templates/nav",
                    "data": "content/nav",
                    "action": "default"
                },
                {
                    "slot": "footer",
                    "template": "templates/footer",
                    "data": "content/footer",
                    "action": "default"
                }
            ],
            "update": []
        },
        "home": {
            "update": 
            [
                {
                    "slot": "main",
                    "template": "templates/accordion",
                    "data": "content/home/accordion",
                    "action": "default"
                }
            ]
        },
        ...
        ...
        "resources": {
            "update": 
            [
                {
                    "slot": "main",
                    "template": "templates/resources",
                    "data": "content/resources",
                    "action": "default"
                }
            ]
        },
        ...
        ...
      }
```


   2. Runs actions
   3. Updates history and url


```js
updateSlot(url, slot_id, template, data, action) {
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
    
    this.slots[slot_id].innerHTML = result.
}
```

## Options

### Load random page
1. Load cached
2. Render on server
3. Render client side

### Update page
1. Load new page
2. Update with content rendered on server
3. Update with cached content
4. Update with content rendered on client


X:Y == 5:1
```
| .info-page                              |
 <-------------X----------> <-------Y---->
| .main-content            | .watercolor  |
| h1 here                  | image top    |
| +----------------------+ | aligned to   |
| | .outline-box         | | h1           |
| +----------------------+ |              |

```