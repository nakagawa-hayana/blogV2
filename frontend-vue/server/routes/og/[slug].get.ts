import satori from 'satori'
import { getFont } from '../../utils/fonts'
import { svgToPng } from '../../utils/resvg'

const WIDTH = 1200
const HEIGHT = 630

interface ArticleLite {
  title: string
  tags: string | null
}

async function fetchArticleLite(slug: string, backendUrl: string): Promise<ArticleLite | null> {
  try {
    const res = await fetch(`${backendUrl}/articles/${slug}`)
    if (!res.ok) return null
    const data = (await res.json()) as any
    return { title: String(data.title ?? ''), tags: data.tags ?? null }
  } catch {
    return null
  }
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

function pickTitleSize(title: string): number {
  const len = title.length
  if (len <= 18) return 78
  if (len <= 28) return 68
  if (len <= 40) return 58
  return 50
}

async function renderTemplate(title: string, tags: string[]): Promise<string> {
  const headingFont = await getFont('zen-maru-gothic-700')
  const monoFont = await getFont('dm-mono-500')
  const titleSize = pickTitleSize(title)

  const node = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 84px',
        backgroundColor: '#fbf4f4',
        backgroundImage:
          'radial-gradient(circle at 88% 12%, #f7e4ea 0%, transparent 42%), radial-gradient(circle at 12% 92%, #ece7f8 0%, transparent 48%)',
        position: 'relative',
        fontFamily: 'Zen Maru Gothic, DM Mono, sans-serif',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '18px',
                    height: '18px',
                    borderRadius: '999px',
                    backgroundColor: '#e9b8cb',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 22,
                    color: '#c26e8c',
                    letterSpacing: '0.04em',
                  },
                  children: 'ardririy no ashiato',
                },
              },
            ],
          },
        },

        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            },
            children: [
              tags.length > 0
                ? {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '10px',
                      flexWrap: 'wrap',
                    },
                    children: tags.slice(0, 3).map((t) => ({
                      type: 'div',
                      props: {
                        style: {
                          padding: '6px 18px',
                          borderRadius: '999px',
                          backgroundColor: '#e9b8cb',
                          color: '#ffffff',
                          fontSize: 24,
                          fontFamily: 'Zen Maru Gothic, sans-serif',
                        },
                        children: `#${t}`,
                      },
                    })),
                  },
                }
                : { type: 'div', props: { style: { height: '4px' } } },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: titleSize,
                    lineHeight: 1.35,
                    fontWeight: 700,
                    color: '#524852',
                    letterSpacing: '0.02em',
                    display: 'block',
                  },
                  children: title,
                },
              },
            ],
          },
        },

        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Zen Maru Gothic, sans-serif',
                    fontSize: 26,
                    color: '#c26e8c',
                  },
                  children: 'ardririyの足跡',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '10px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '14px', height: '14px', borderRadius: '999px',
                          backgroundColor: '#e9b8cb',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '14px', height: '14px', borderRadius: '999px',
                          backgroundColor: '#b7a7de',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '14px', height: '14px', borderRadius: '999px',
                          backgroundColor: '#f7e4ea',
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  }

  return satori(node as any, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Zen Maru Gothic', data: headingFont, weight: 700, style: 'normal' },
      { name: 'DM Mono', data: monoFont, weight: 500, style: 'normal' },
    ],
  })
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const bare = slug.replace(/\.png$/i, '')
  const cfg = useRuntimeConfig()

  let title = 'ardririyの足跡'
  let tagList: string[] = []

  if (bare !== 'default') {
    const article = await fetchArticleLite(bare, cfg.public.backendUrl)
    if (article) {
      title = article.title || title
      tagList = parseTags(article.tags)
    }
  }

  const svg = await renderTemplate(title, tagList)
  const png = await svgToPng(svg, 1200)

  setHeader(event, 'Content-Type', 'image/png')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return png
})
