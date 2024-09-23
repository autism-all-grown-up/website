[...document.querySelectorAll('a')]
    .filter(link => this.isExternalLink(link))
    .forEach(link => link.target = '_blank');