/**
 * Magic Bento: on the index page, wrap each topic section (h2 + hr + ul) in a .bento-card
 * and add data-topic for hover glow colors. Only runs when article has .magic-bento.
 */
function slugFromHeading(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-|-$/g, "") || "topic"
}

function initBento() {
  if (document.body?.getAttribute("data-slug") !== "index") return

  const article = document.querySelector("article.magic-bento") as HTMLElement | null
  if (!article) return

  const children = Array.from(article.children)
  const intro: Element[] = []
  const cards: { card: HTMLDivElement; topic: string }[] = []
  let i = 0

  while (i < children.length) {
    const el = children[i]
    if (el.tagName === "H2") {
      const topic = slugFromHeading((el as HTMLElement).innerText || "")
      const card = document.createElement("div")
      card.className = "bento-card"
      card.setAttribute("data-topic", topic)
      card.appendChild(el.cloneNode(true))

      let skip = 1
      if (children[i + 1]?.tagName === "HR") {
        card.appendChild(children[i + 1].cloneNode(true))
        skip += 1
      }
      if (children[i + skip]?.tagName === "UL") {
        card.appendChild(children[i + skip].cloneNode(true))
        skip += 1
      }
      cards.push({ card, topic })
      i += skip
      continue
    }
    intro.push(el)
    i += 1
  }

  if (cards.length === 0) return

  const introClone = intro.map((node) => node.cloneNode(true))
  article.innerHTML = ""
  introClone.forEach((node) => article.appendChild(node))

  const grid = document.createElement("div")
  grid.className = "bento-grid"
  cards.forEach(({ card }) => grid.appendChild(card))
  article.appendChild(grid)

  // Decrypt animation on bento card headings
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&"
  function decrypt(el: HTMLElement) {
    const final = el.dataset.final ?? el.textContent ?? ""
    el.dataset.final = final
    let frame = 0
    const frames = 22
    const id = setInterval(() => {
      el.textContent = final.split("").map((ch, i) => {
        if (ch === " ") return " "
        if (i < Math.floor((frame / frames) * final.length)) return ch
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join("")
      if (++frame > frames) { clearInterval(id); el.textContent = final }
    }, 38)
  }

  grid.querySelectorAll<HTMLElement>(".bento-card h2").forEach((h2) => {
    // Fire once on load with a staggered delay
    const idx = Array.from(grid.querySelectorAll(".bento-card h2")).indexOf(h2)
    setTimeout(() => decrypt(h2), idx * 120)
    // Re-fire on card hover
    h2.closest(".bento-card")?.addEventListener("mouseenter", () => decrypt(h2))
  })
}

document.addEventListener("nav", () => initBento())
