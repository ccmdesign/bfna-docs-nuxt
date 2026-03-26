import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import series from './contentful/series'

export default defineContentConfig({
  collections: {
    filters: defineCollection({
      source: 'filters/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        years: z.array(z.string()),
        workstreams: z.array(z.string()),
        durations: z.array(z.string()),
        slug: z.string()
      })
    }),
    series: defineCollection({
      source: 'series/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        serieId: z.string(),
        title: z.string(),
        description: z.string(),
        documentaries: z.array(z.unknown()),
        slug: z.string()
      })
    }),
    latest: defineCollection({
      source: 'latest/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        order: z.number(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          poster: z.string().url().optional(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown()),
          duration: z.string().optional(),
          year: z.string().optional(),
          thumbnail: z.string().url().optional()
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        series: z.array(z.unknown()),
        slug: z.string(),
        tags: z.array(z.string()),
        previewStartsAt: z.number().optional()
      })
    }),
    allvideos: defineCollection({
      source: 'allvideos/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        order: z.number(),
        docYear: z.number(),
        date: z.string().optional(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        animatedThumbnail: z.string().url().optional(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          poster: z.string().url().optional(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown()),
          duration: z.string().optional(),
          year: z.string().optional(),
          thumbnail: z.string().url().optional()
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        series: z.array(z.unknown()),
        slug: z.string(),
        tags: z.array(z.string()),
        relatedDocumentaries: z.array(z.string()).optional(),
        keywords: z.array(z.string()),
        previewStartsAt: z.number().optional()
      })
    }),
    trailer: defineCollection({
      source: 'trailer/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          poster: z.string().url().optional(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown())
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        series: z.array(z.unknown()),
        slug: z.string(),
        tags: z.array(z.string()),
        previewStartsAt: z.number().optional()
      })
    }),
    featuredvideo: defineCollection({
      source: 'featuredvideo/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        animatedThumbnail: z.string().url().optional(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          poster: z.string().url().optional(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown())
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        series: z.array(z.unknown()),
        slug: z.string(),
        tags: z.array(z.string()),
        keywords: z.array(z.string()),
        previewStartsAt: z.number().optional()
      })
    }),
    featuredvideos: defineCollection({
      source: 'featuredvideos/*.json',
      type: 'data',
      schema: z.object({
        id: z.union([z.string(), z.number()]),
        order: z.number(),
        title: z.string(),
        slug: z.string()
      })
    }),
  }
})
