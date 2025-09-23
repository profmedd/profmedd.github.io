class LinksDirectory {
    constructor() {
        this.allLinks = data;
        this.filteredLinks = [...this.allLinks];
        this.allTags = this.extractAllTags();
        this.activeFilters = new Set();
        this.sections = this.organizeLinksBySections();

        this.init();
    }

    init() {
        this.renderTagFilters();
        this.renderLinks();
        this.setupEventListeners();
    }

    extractAllTags() {
        const tagSet = new Set();
        this.allLinks.forEach(link => {
            link.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }

    renderTagFilters() {
        const tagFiltersContainer = document.getElementById('tag-filters');

        const allTagsButton = document.createElement('button');
        allTagsButton.className = 'tag-filter active';
        allTagsButton.textContent = 'All';
        allTagsButton.addEventListener('click', () => this.clearFilters());
        tagFiltersContainer.appendChild(allTagsButton);

        this.allTags.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.className = 'tag-filter';
            tagButton.textContent = tag;
            tagButton.addEventListener('click', () => this.toggleTagFilter(tag));
            tagFiltersContainer.appendChild(tagButton);
        });
    }

    organizeLinksBySections() {
        const sections = {
            'General': [],
            'YouTube': [],
            'Twitter/X': [],
            'TikTok': [],
            'Instagram': []
        };

        this.filteredLinks.forEach(link => {
            const domain = this.extractDomainName(link.url);

            if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                sections['YouTube'].push(link);
            } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
                sections['Twitter/X'].push(link);
            } else if (domain.includes('tiktok.com')) {
                sections['TikTok'].push(link);
            } else if (domain.includes('instagram.com')) {
                sections['Instagram'].push(link);
            } else {
                sections['General'].push(link);
            }
        });

        return sections;
    }

    renderLinks() {
        const container = document.getElementById('links-grid-container');
        const noResults = document.getElementById('no-results');

        container.innerHTML = '';

        if (this.filteredLinks.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        // Re-organize links by sections based on current filtered links
        this.sections = this.organizeLinksBySections();

        // Render each section
        Object.entries(this.sections).forEach(([sectionName, links]) => {
            if (links.length > 0) {
                // Create section container
                const sectionContainer = document.createElement('div');
                sectionContainer.className = 'section-container';

                // Create section header
                const sectionHeader = document.createElement('h2');
                sectionHeader.className = 'section-header';
                sectionHeader.textContent = sectionName;
                sectionContainer.appendChild(sectionHeader);

                // Create section grid
                const sectionGrid = document.createElement('div');
                sectionGrid.className = 'section-grid';

                links.forEach(link => {
                    const linkCard = this.createLinkCard(link);
                    sectionGrid.appendChild(linkCard);
                });

                sectionContainer.appendChild(sectionGrid);
                container.appendChild(sectionContainer);
            }
        });
    }

    createLinkCard(link) {
        const card = document.createElement('article');
        const isSocialMedia = this.isSocialMediaLink(link.url);
        card.className = isSocialMedia ? 'link-card social-media-card' : 'link-card';

        const title = document.createElement('h2');
        title.className = 'link-title';

        const titleContent = document.createElement('div');
        titleContent.className = 'link-title-content';

        const favicon = document.createElement('img');
        favicon.className = 'link-favicon';
        favicon.src = `https://www.google.com/s2/favicons?domain=${this.extractDomainName(link.url)}&sz=16`;
        favicon.alt = 'Website favicon';
        favicon.loading = 'lazy';

        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.textContent = this.extractDomainName(link.url);

        titleContent.appendChild(favicon);
        titleContent.appendChild(linkElement);
        title.appendChild(titleContent);

        // Only show description if it exists and is not empty, or if it's not a social media link
        let description = null;
        if (link.description && link.description.trim() !== '') {
            description = document.createElement('p');
            description.className = 'link-description';
            description.textContent = link.description;
        }

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'link-tags';

        link.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'tag';
            tagSpan.textContent = tag;
            tagSpan.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTagFilter(tag);
            });
            tagsContainer.appendChild(tagSpan);
        });

        card.appendChild(title);
        if (description) {
            card.appendChild(description);
        }

        // Add social media widget if applicable
        if (isSocialMedia) {
            const widget = this.createSocialMediaWidget(link.url);
            if (widget) {
                card.appendChild(widget);
            }
        }

        card.appendChild(tagsContainer);

        return card;
    }

    isSocialMediaLink(url) {
        const socialDomains = [
            'twitter.com',
            'x.com',
            'instagram.com',
            'tiktok.com',
            'youtube.com',
            'youtu.be'
        ];

        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return socialDomains.some(socialDomain => domain.includes(socialDomain));
        } catch {
            return false;
        }
    }

    createSocialMediaWidget(url) {
        const domain = this.extractDomainName(url);
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'social-widget';

        if (domain.includes('twitter.com') || domain.includes('x.com')) {
            return this.createTwitterPreview(url, widgetContainer);
        } else if (domain.includes('instagram.com')) {
            return this.createInstagramWidget(url, widgetContainer);
        } else if (domain.includes('tiktok.com')) {
            return this.createTikTokWidget(url, widgetContainer);
        } else if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
            return this.createYouTubeWidget(url, widgetContainer);
        }

        return null;
    }

    createTwitterPreview(url, container) {
        // Obtener ID del tuit
        let tweetId;
        try {
            tweetId = url.split('/status/')[1].split(/[/?]/)[0];
        } catch {
            console.warn('URL de tuit inválida:', url);
            return container;
        }

        // Generar enlace a la publicación en publish.twitter.com
        const publishUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;

        // Crear enlace contenedor
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.style.display = 'inline-block';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';

        // Crear imagen de preview
        const img = document.createElement('img');
        // Nota: el endpoint oembed devuelve JSON con `thumbnail_url`, necesitamos fetch
        fetch(publishUrl)
            .then(res => res.json())
            .then(data => {
                if (data.thumbnail_url) {
                    img.src = data.thumbnail_url;
                    img.alt = 'Tweet preview';
                    img.style.maxWidth = '100%';
                    img.style.border = '1px solid #ccc';
                } else {
                    // Si no hay thumbnail, fallback a un enlace de texto
                    link.textContent = 'Ver tuit';
                }
            })
            .catch(() => {
                link.textContent = 'Ver tuit';
            });

        link.appendChild(img);
        container.appendChild(link);

        return container;
    }


    createInstagramWidget(url, container) {
        // Create Instagram embed
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'instagram-media';
        blockquote.setAttribute('data-instgrm-permalink', url);
        blockquote.setAttribute('data-instgrm-version', '14');
        blockquote.style.background = '#FFF';
        blockquote.style.border = '0';
        blockquote.style.borderRadius = '3px';
        blockquote.style.margin = '1px';
        blockquote.style.maxWidth = '100%';
        blockquote.style.minWidth = '326px';
        blockquote.style.padding = '0';
        blockquote.style.width = '100%';

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = 'Loading Instagram post...';
        blockquote.appendChild(link);

        container.appendChild(blockquote);

        // Load Instagram embed script if not already loaded
        if (!window.instgrm) {
            const script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
        } else {
            window.instgrm.Embeds.process();
        }

        return container;
    }

    createTikTokWidget(url, container) {
        // Extract TikTok video ID from URL
        const videoId = this.extractTikTokVideoId(url);
        if (!videoId) return null;

        const blockquote = document.createElement('blockquote');
        blockquote.className = 'tiktok-embed';
        blockquote.setAttribute('cite', url);
        blockquote.setAttribute('data-video-id', videoId);
        blockquote.style.maxWidth = '605px';
        blockquote.style.minWidth = '325px';

        const section = document.createElement('section');
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.textContent = 'Loading TikTok video...';
        section.appendChild(link);
        blockquote.appendChild(section);

        container.appendChild(blockquote);

        // Load TikTok embed script if not already loaded
        if (!document.querySelector('script[src*="tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.head.appendChild(script);
        }

        return container;
    }

    createYouTubeWidget(url, container) {
        const videoId = this.extractYouTubeVideoId(url);
        if (!videoId) return null;

        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '315';
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.title = 'YouTube video player';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.style.borderRadius = '8px';

        container.appendChild(iframe);
        return container;
    }

    extractTikTokVideoId(url) {
        try {
            const match = url.match(/\/video\/(\d+)/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    extractYouTubeVideoId(url) {
        try {
            const urlObj = new URL(url);

            // Handle youtube.com URLs
            if (urlObj.hostname.includes('youtube.com')) {
                return urlObj.searchParams.get('v');
            }

            // Handle youtu.be URLs
            if (urlObj.hostname.includes('youtu.be')) {
                return urlObj.pathname.slice(1);
            }

            return null;
        } catch {
            return null;
        }
    }

    extractDomainName(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace('www.', '');
        } catch {
            return url;
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm && this.activeFilters.size === 0) {
            this.filteredLinks = [...this.allLinks];
        } else {
            this.filteredLinks = this.allLinks.filter(link => {
                const matchesSearch = !searchTerm ||
                    link.description.toLowerCase().includes(searchTerm) ||
                    link.url.toLowerCase().includes(searchTerm) ||
                    link.tags.some(tag => tag.toLowerCase().includes(searchTerm));

                const matchesFilters = this.activeFilters.size === 0 ||
                    link.tags.some(tag => this.activeFilters.has(tag));

                return matchesSearch && matchesFilters;
            });
        }

        this.renderLinks();
    }

    toggleTagFilter(tag) {
        if (this.activeFilters.has(tag)) {
            this.activeFilters.delete(tag);
        } else {
            this.activeFilters.add(tag);
        }

        this.updateTagFilterUI();
        this.handleSearch(document.getElementById('search-input').value);
    }

    clearFilters() {
        this.activeFilters.clear();
        document.getElementById('search-input').value = '';
        this.updateTagFilterUI();
        this.filteredLinks = [...this.allLinks];
        this.renderLinks();
    }

    updateTagFilterUI() {
        const tagFilters = document.querySelectorAll('.tag-filter');

        tagFilters.forEach((button, index) => {
            if (index === 0) { // "All" button
                button.classList.toggle('active', this.activeFilters.size === 0);
            } else {
                const tag = button.textContent;
                button.classList.toggle('active', this.activeFilters.has(tag));
            }
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LinksDirectory();
});