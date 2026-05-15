import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  if (title) {
    return (
      <>
        <h1 class={classNames(displayClass, "article-title")} id="article-title-typewriter" data-title={title}>
          <span class="typewriter-text"></span>
          <span class="typewriter-cursor">|</span>
        </h1>
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  function typewrite(el, text, speed) {
    var span = el.querySelector('.typewriter-text');
    var cursor = el.querySelector('.typewriter-cursor');
    if (!span) return;
    span.textContent = '';
    var i = 0;
    cursor.style.opacity = '1';
    var id = setInterval(function() {
      span.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(id);
        setTimeout(function(){ cursor.style.opacity = '0'; }, 800);
      }
    }, speed);
  }
  function init() {
    var el = document.getElementById('article-title-typewriter');
    if (!el) return;
    var text = el.dataset.title || '';
    typewrite(el, text, 38);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
        `}} />
      </>
    )
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
.typewriter-cursor {
  display: inline-block;
  font-weight: 300;
  color: var(--secondary);
  margin-left: 1px;
  animation: cursor-blink 0.8s ease-in-out infinite;
}
@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
