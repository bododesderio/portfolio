document.addEventListener('DOMContentLoaded', function() {
    // Get post ID from URL
    const postId = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Fetch posts data
    fetch('/blog/data/posts.json')
        .then(response => response.json())
        .then(posts => {
            // Find the current post
            const currentPost = posts.find(post => post.id == postId);
            
            if (!currentPost) {
                showError();
                return;
            }
            
            // Update page title
            document.title = `${currentPost.title} | Bodo Desderio`;
            
            // Update post content
            document.getElementById('post-title').textContent = currentPost.title;
            document.getElementById('post-date').innerHTML = `
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="7.25" stroke="currentColor" stroke-width="1.5"></circle>
                    <path stroke="currentColor" stroke-width="1.5" d="M12 8V12L14 14"></path>
                </svg>
                ${formatDate(currentPost.date)}
            `;
            
            document.getElementById('post-categories').innerHTML = `
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.25 17.25V9.75C19.25 8.64543 18.3546 7.75 17.25 7.75H4.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25Z"></path>
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 7.5L12.5685 5.7923C12.2181 5.14977 11.5446 4.75 10.8127 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V11"></path>
                </svg>
                <span class="cat-links">
                    <a href="blog.html?category=${currentPost.category.toLowerCase()}">${currentPost.category}</a>
                </span>
            `;
            
            document.getElementById('post-image').src = currentPost.image;
            document.getElementById('post-image').alt = currentPost.title;
            
            document.getElementById('post-content').innerHTML = `
                <p class="lead">${currentPost.excerpt}</p>
                ${currentPost.content}
                <div class="post-nav">
                    ${getPostNavigation(posts, currentPost.id)}
                </div>
            `;
            
            // Load related posts
            loadRelatedPosts(posts, currentPost.id, currentPost.category);
        })
        .catch(error => {
            console.error('Error loading post:', error);
            showError();
        });
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getPostNavigation(posts, currentPostId) {
    const index = posts.findIndex(post => post.id == currentPostId);
    let navHtml = '';
    
    if (index > 0) {
        const prevPost = posts[index - 1];
        navHtml += `
            <div class="post-nav__prev">
                <a href="/blog/post/${prevPost.id}.html" rel="prev">
                    <span>Previous</span>
                    ${prevPost.title}
                </a>
            </div>
        `;
    }
    
    if (index < posts.length - 1) {
        const nextPost = posts[index + 1];
        navHtml += `
            <div class="post-nav__next">
                <a href="/blog/post/${nextPost.id}.html" rel="next">
                    <span>Next</span>
                    ${nextPost.title}
                </a>
            </div>
        `;
    }
    
    return navHtml;
}

function loadRelatedPosts(posts, currentPostId, category) {
    const relatedPosts = posts
        .filter(post => post.id != currentPostId && post.category === category)
        .slice(0, 3);
    
    const relatedPostsContainer = document.getElementById('related-posts');
    
    if (relatedPosts.length === 0) {
        relatedPostsContainer.innerHTML = '<p>No related posts found.</p>';
        return;
    }
    
    relatedPostsContainer.innerHTML = relatedPosts.map(post => `
        <div class="grid-list-items__item blog-card">
            <div class="blog-card__header">
                <h3 class="blog-card__title"><a href="/blog/post/${post.id}.html">${post.title}</a></h3>
            </div>
            <div class="blog-card__text">
                <p>${post.excerpt}</p>
            </div>
        </div>
    `).join('');
}

function showError() {
    document.getElementById('content').innerHTML = `
        <div class="row">
            <div class="column xl-12">
                <h1>Post Not Found</h1>
                <p>The requested blog post could not be found.</p>
                <a href="/blog" class="btn btn--primary">Back to Blog</a>
            </div>
        </div>
    `;
}