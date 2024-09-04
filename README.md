# JavaScript Web Framework User Guide

This guide explains how the provided JavaScript web framework works and provides instructions on how to configure templates and plugins for your web application.

## Overview

This framework dynamically renders content from templates and markdown files, allowing you to modularize your web content. It also enables you to attach interactive behavior to elements via plugins that can be dynamically loaded.

### Key Features:
- **Dynamic Template Rendering**: Content is rendered based on templates, which are populated with data from a configuration file.
- **Markdown to HTML Conversion**: Markdown files can be converted to HTML and injected into templates.
- **Plugin System**: Plugins can be dynamically loaded and used to add interactive behaviors such as lightboxes and scrolling.
- **Event Delegation**: Events are delegated to parent elements, allowing for efficient handling of dynamic content.

---

## Configuration Files

There are two main configuration files that control how the framework operates:
1. **`./config.json`** (main configuration file for the entire page)
2. **`./content/{subdir}/config.json`** (config for each content section)

### 1. Main `config.json`

The main `config.json` specifies the templates to be rendered and the plugins to be loaded.

```json
{
    "render": [
        {
            "template": "nav",
            "dir": "nav"
        },
        {
            "template": "accordion",
            "dir": "home/accordion"
        }
    ],
    "plugins": [
        {
            "path": "lightbox",
            "event": "click",
            "parent": ".accordion",
            "target": ".lightbox-trigger",
            "callback": "attachLightboxListeners"
        },
        {
            "path": "accordion_scroll",
            "event": "click",
            "parent": ".accordion",
            "target": "summary",
            "callback": "setScrollBehavior"
        }
    ]
}
```

- **`render`**: Defines the templates that will be rendered.
    - **`template`**: The name of the template file (e.g., `accordion.html`).
    - **`dir`**: Directory where the content resides.
  
- **`plugins`**: Defines the plugins that will be loaded.
    - **`path`**: Path to the plugin script.
    - **`event`**: The event to listen for (e.g., `click`).
    - **`parent`**: CSS selector for the parent element that will handle event delegation.
    - **`target`**: CSS selector for the child elements that will trigger the event.
    - **`callback`**: Name of the callback function inside the plugin.

---

### 2. Section-Specific `config.json`

Each content section (e.g., `accordion`) has its own `config.json` file, which defines the structure and data for that section.

Example (`content/home/accordion/config.json`):

```json
{
    "target": "main",
    "template": "accordion.html",
    "data": [
        {
            "summary_text": "Many autistic adults in Oregon are invisible, marginalized, and struggling. We can fix this.",
            "thumbnail_image": "images/thumbnails/oregon_adults_autistic_and_or_receiving_idd_services_thumbnail.png",
            "thumbnail_alt_text": "Population chart thumbnail",
            "main_image": "images/oregon_adults_autistic_and_or_receiving_idd_services.png",
            "main_image_alt_text": "Chart showing population of adults in oregon receiving I/DD services and/or autistic.",
            "source_data": [
                {"content_name": "main_text", "source": "mission.md"},
                {"content_name": "fig_caption", "source": "population_plot_caption.md"}
            ]
        }
    ]
}
```

---

## How to Use

### 1. Rendering Templates
Templates are rendered dynamically by specifying them in the main `config.json`. Data is pulled from individual section-specific `config.json` files, and any markdown content is automatically converted to HTML.

### 2. Adding Plugins
Plugins are added by specifying them in the main `config.json`. Each plugin must have an event listener, parent element, target element, and callback function. The framework automatically loads the plugin, attaches the event listener, and triggers the callback when the event occurs.

### 3. Event Delegation
The `delegateEvent` function efficiently manages events by attaching listeners to parent elements, allowing for dynamic content to be handled seamlessly. This is especially useful for content like accordions or modals that are rendered after the page loads.

---

## Suggestions for Use
- **Modularity**: Break your content into sections, and use templates to keep your HTML clean


## Why Use `async/await` and `Promise.all` in This Framework

In this framework, we heavily rely on `async/await` and `Promise.all` to handle asynchronous operations like fetching data, loading templates, and rendering content. These concepts play a crucial role in ensuring that all dynamic content is loaded efficiently and that the user interface remains responsive while data is being retrieved.

### 1. **Understanding `async/await`**
At its core, JavaScript is single-threaded, meaning it can only execute one piece of code at a time. When we make a network request (such as fetching a file), it can take time for the server to respond. During this time, we don't want the entire application to freeze and wait for that response. This is where **asynchronous programming** comes in, and `async/await` makes working with asynchronous code much more readable and maintainable.

- **`async`**: Declares that a function contains asynchronous operations. The function automatically returns a `Promise` and can use the `await` keyword inside.
- **`await`**: Pauses the execution of the function until the `Promise` is resolved (i.e., until the network request completes), without blocking the rest of the application.

### 2. **The Role of `Promise.all`**
`Promise.all` is used to handle multiple asynchronous operations at the same time. It allows us to initiate several asynchronous tasks (like fetching multiple files) in parallel, and then waits until all of those tasks are complete. This is much more efficient than waiting for each task to finish before starting the next one.

In our framework:
- **Fetching Content**: When rendering a template, we may need to fetch multiple markdown files or other assets (like JSON data). Instead of fetching them one by one, we use `Promise.all` to initiate all fetch operations in parallel and wait for all of them to complete before rendering the content.
- **Performance Benefits**: By using `Promise.all`, we can drastically reduce the time it takes to render a page, especially when there are multiple files or network requests involved. Instead of waiting for one file to load before fetching the next, all files are loaded simultaneously.

### Example Use Case in the Framework:
```javascript
// This function uses async/await and Promise.all to fetch multiple markdown files at the same time
const promises = config.data.map(async item => {
    if (item.source_data) {
      await Promise.all(item.source_data.map(async source => {
        item[source.content_name] = await convertMarkdownToHtml(`${contentDir}/${source.source}`);
      }));
    }
});
await Promise.all(promises);
```

- **Why `Promise.all` Here?**: In this example, each item in `config.data` may have multiple `source_data` files (e.g., markdown files). Instead of fetching these files one by one, we use `Promise.all` to fetch all of them in parallel. This ensures that all the required files are loaded as quickly as possible, allowing the template to render once all files are available.

### Advantages:
1. **Concurrency**: Using `Promise.all`, we can fetch all required data in parallel, making the process faster and more efficient than fetching files sequentially.
2. **Maintainability**: `async/await` syntax makes it easier to write and understand asynchronous code. This allows for cleaner error handling and simpler logic, especially in more complex applications.
3. **User Experience**: While files are being fetched, the user interface remains responsive, meaning the user isn't stuck waiting for the content to load one by one. This leads to a smoother and faster experience.

By leveraging `async/await` and `Promise.all`, we're ensuring that this framework is not only fast but also scalable and able to handle more complex content loading operations as needed.